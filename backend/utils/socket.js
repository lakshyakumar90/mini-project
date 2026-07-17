const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('../models/Chat');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const { pubClient, subClient, redisClient } = require('../config/redis');
const { createAdapter } = require('@socket.io/redis-adapter');

let ioInstance = null;

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("$")).digest("hex");
};

const getIO = () => {
    return ioInstance;
};

// Map to track online status locally for immediate lookups
const localPresenceMap = new Map(); // userId -> { status: 'online', socketIds: Set<socketId> }

const initializeSocket = (server) => {
    const io = socket(server, {
        path: '/socket.io/',
        cors: {
            origin: (origin, callback) => callback(null, true),
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    ioInstance = io;

    // Attach Redis Adapter if pub/sub clients become ready
    const attachRedisAdapter = () => {
        if (pubClient.status === 'ready' && subClient.status === 'ready') {
            try {
                io.adapter(createAdapter(pubClient, subClient));
                console.log('✅ Socket.io Redis Adapter attached successfully');
            } catch (err) {
                console.warn('⚠️ Could not attach Socket.io Redis Adapter:', err.message);
            }
        }
    };

    if (pubClient.status === 'ready' && subClient.status === 'ready') {
        attachRedisAdapter();
    } else {
        pubClient.on('ready', attachRedisAdapter);
    }

    // Log connection-level errors to detect client retry storms early
    io.engine.on('connection_error', (err) => {
        console.warn('⚠️ Socket.io connection_error:', err.code, err.message);
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Register user identity on socket connection
        socket.on('register_user', async (userId) => {
            if (!userId) return;
            const strId = userId.toString();

            // Idempotency guard: skip if already registered as this user on this socket
            if (socket.userId === strId) return;

            socket.userId = strId;
            socket.join(strId); // Join user's personal room for notifications & messages
            
            // Update local map
            if (!localPresenceMap.has(strId)) {
                localPresenceMap.set(strId, { status: 'online', socketIds: new Set() });
            }
            localPresenceMap.get(strId).socketIds.add(socket.id);
            console.log(`User ${socket.id} registered as userId: ${strId}`);

            // Update Redis presence
            try {
                await redisClient.hset('user_presence', userId, 'online');
            } catch (err) {}

            // Broadcast online status to user's connections
            try {
                const connections = await Connection.find({
                    $or: [
                        { requester: userId, status: 'accepted' },
                        { recipient: userId, status: 'accepted' }
                    ]
                });
                connections.forEach(conn => {
                    const friendId = conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString();
                    io.to(friendId).emit('user_status_change', { userId, status: 'online' });
                });
            } catch (err) {
                console.error('Error broadcasting presence:', err.message);
            }
        });

        // Check online status for a list of user IDs
        socket.on('get_users_status', async (userIds = [], callback) => {
            if (typeof callback !== 'function') return;
            const statusMap = {};
            const validIds = Array.isArray(userIds) ? userIds.filter(id => id && (typeof id === 'string' || typeof id === 'object')) : [];
            const redisIds = [];

            for (const rawId of validIds) {
                const id = rawId.toString();
                const local = localPresenceMap.get(id);
                if (local && local.status === 'online' && local.socketIds.size > 0) {
                    statusMap[id] = 'online';
                } else {
                    redisIds.push(id);
                }
            }

            if (redisIds.length > 0 && redisClient) {
                try {
                    const redisStatuses = await redisClient.hmget('user_presence', ...redisIds);
                    redisIds.forEach((id, idx) => {
                        statusMap[id] = redisStatuses[idx] || 'offline';
                    });
                } catch (e) {
                    redisIds.forEach(id => {
                        statusMap[id] = 'offline';
                    });
                }
            }

            callback(statusMap);
        });

        // Typing indicators
        socket.on('typing_start', ({ receiverId, chatId }) => {
            if (!receiverId) return;
            io.to(receiverId).emit('typing_start', {
                senderId: socket.userId,
                chatId
            });
        });

        socket.on('typing_stop', ({ receiverId, chatId }) => {
            if (!receiverId) return;
            io.to(receiverId).emit('typing_stop', {
                senderId: socket.userId,
                chatId
            });
        });

        // Join a room (user's ID) to receive messages
        // Note: identity is established via register_user only. join_room is for extra rooms.
        socket.on('join_room', (roomId) => {
            if (roomId) {
                const strRoomId = roomId.toString();
                socket.join(strRoomId);
                // Do NOT set socket.userId here — only register_user should establish identity
                console.log(`Socket ${socket.id} joined room: ${strRoomId}`);
            }
        });

        // Join a chat room with another user
        socket.on('join_chat', ({ userId, targetUserId }) => {
            if (userId && targetUserId) {
                const roomId = getSecretRoomId(userId.toString(), targetUserId.toString());
                socket.join(roomId);
            }
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { sender, receiver, content, timestamp, _id } = data;
                if (!sender || !receiver || !content) {
                    console.log('Invalid message data:', data);
                    return;
                }

                const senderStr = sender.toString();
                const receiverStr = receiver.toString();
                console.log(`Message sent from ${senderStr} to ${receiverStr}:`, content);

                // Check if users are connected or have job application relationship or existing chat
                let canMessage = false;
                const existingChat = await Chat.findOne({
                    participants: { $all: [senderStr, receiverStr] }
                });
                if (existingChat) {
                    canMessage = true;
                } else {
                    const connection = await Connection.findOne({
                        $or: [
                            { requester: senderStr, recipient: receiverStr, status: 'accepted' },
                            { requester: receiverStr, recipient: senderStr, status: 'accepted' }
                        ]
                    });
                    if (connection) {
                        canMessage = true;
                    } else {
                        const job = await Job.findOne({
                            $or: [
                                { postedBy: senderStr, 'applications.applicant': receiverStr },
                                { postedBy: receiverStr, 'applications.applicant': senderStr }
                            ],
                            'applications.status': { $in: ['pending', 'reviewed', 'accepted'] }
                        });
                        if (job) {
                            canMessage = true;
                        }
                    }
                }

                if (!canMessage) {
                    console.log('Users are not connected or allowed to message, rejected');
                    socket.emit('message_error', { error: 'You can only message connections or job applicants/posters' });
                    return;
                }

                // Simplify status detection via localPresenceMap
                let initialStatus = 'sent';
                if (localPresenceMap.has(receiverStr) && localPresenceMap.get(receiverStr).socketIds.size > 0) {
                    initialStatus = 'delivered';
                }

                // Create a new message object
                const newMessage = {
                    senderId: senderStr,
                    text: content.trim(),
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                    status: initialStatus
                };

                let chat = existingChat;
                if (!chat) {
                    chat = new Chat({
                        participants: [senderStr, receiverStr],
                        messages: [newMessage]
                    });
                } else {
                    chat.messages.push(newMessage);
                }

                await chat.save();

                const savedMessage = chat.messages[chat.messages.length - 1];

                const messagePayload = {
                    _id: savedMessage._id,
                    senderId: savedMessage.senderId,
                    text: savedMessage.text,
                    timestamp: savedMessage.timestamp,
                    sender: savedMessage.senderId,
                    status: savedMessage.status || initialStatus
                };

                console.log(`Emitting message to receiver: ${receiverStr}`);

                io.to(receiverStr).emit('receive_message', messagePayload);

                socket.emit('message_sent', {
                    _id: savedMessage._id,
                    tempId: _id,
                    timestamp: savedMessage.timestamp,
                    status: savedMessage.status || initialStatus
                });

                // Create notification in DB and emit
                try {
                    const notif = await Notification.create({
                        recipient: receiver,
                        sender: sender,
                        type: 'new_message',
                        entityId: savedMessage._id,
                        entityModel: 'Message',
                        message: `Sent you a new message: "${content.trim().substring(0, 40)}${content.trim().length > 40 ? '...' : ''}"`
                    });
                    const populatedNotif = await Notification.findById(notif._id).populate('sender', 'name profilePicture role');
                    io.to(receiver).emit('notification', populatedNotif);
                } catch (ne) {
                    console.warn('Could not create message notification:', ne.message);
                }

            } catch (err) {
                console.error('Error in send_message handler:', err);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle marking messages as read
        socket.on('mark_messages_read', async ({ senderId }) => {
            try {
                if (!socket.userId || !senderId) return;
                const currentUserId = socket.userId.toString();
                const targetSenderId = senderId.toString();
                const chat = await Chat.findOne({
                    participants: { $all: [currentUserId, targetSenderId] }
                });
                if (chat && chat.messages) {
                    let modified = false;
                    chat.messages.forEach(msg => {
                        if (msg && msg.senderId.toString() === targetSenderId && msg.status !== 'read') {
                            msg.status = 'read';
                            modified = true;
                        }
                    });
                    if (modified) {
                        await chat.save();
                        io.to(targetSenderId).emit('messages_read', {
                            readerId: currentUserId,
                            chatId: currentUserId
                        });
                    }
                }
            } catch (err) {
                console.error('Error in mark_messages_read:', err);
            }
        });

        // Handle message delivered confirmation
        socket.on('message_delivered', async ({ messageId, senderId }) => {
            try {
                if (!socket.userId || !senderId) return;
                const currentUserId = socket.userId.toString();
                const targetSenderId = senderId.toString();
                const chat = await Chat.findOne({
                    participants: { $all: [currentUserId, targetSenderId] }
                });
                if (chat && chat.messages) {
                    const msg = chat.messages.id(messageId);
                    if (msg && msg.status === 'sent') {
                        msg.status = 'delivered';
                        await chat.save();
                        io.to(targetSenderId).emit('message_status_update', {
                            messageId,
                            status: 'delivered',
                            chatId: currentUserId
                        });
                    }
                }
            } catch (err) {
                console.error('Error in message_delivered:', err);
            }
        });

        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${socket.id}`);
            const userId = socket.userId;
            if (userId && localPresenceMap.has(userId)) {
                const local = localPresenceMap.get(userId);
                local.socketIds.delete(socket.id);
                if (local.socketIds.size === 0) {
                    local.status = 'offline';
                    localPresenceMap.delete(userId);
                    const lastSeen = new Date().toISOString();
                    try {
                        await redisClient.hset('user_presence', userId, `offline:${lastSeen}`);
                    } catch (err) {}

                    // Broadcast offline status
                    try {
                        const connections = await Connection.find({
                            $or: [
                                { requester: userId, status: 'accepted' },
                                { recipient: userId, status: 'accepted' }
                            ]
                        });
                        connections.forEach(conn => {
                            const friendId = conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString();
                            io.to(friendId).emit('user_status_change', { userId, status: 'offline', lastSeen });
                        });
                    } catch (err) {}
                }
            }
        });
    });

    return io;
};

module.exports = initializeSocket;
module.exports.getIO = getIO;
module.exports.getSecretRoomId = getSecretRoomId;
module.exports.localPresenceMap = localPresenceMap;