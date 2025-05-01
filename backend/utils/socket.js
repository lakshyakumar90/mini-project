const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('../models/Chat');
const Connection = require('../models/Connection');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("$")).digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a room (user's ID) to receive messages
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);
        });

        // Join a chat room with another user
        socket.on('join_chat', ({ userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            socket.join(roomId);
            console.log(`User ${socket.id} joined chat room: ${roomId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { sender, receiver, content, timestamp } = data;
                console.log(`Message sent from ${sender} to ${receiver}:`, content);

                // Check if users are connected
                const connection = await Connection.findOne({
                    $or: [
                        { requester: sender, recipient: receiver, status: 'accepted' },
                        { requester: receiver, recipient: sender, status: 'accepted' }
                    ]
                });

                if (!connection) {
                    console.log('Users are not connected, message rejected');
                    return;
                }

                // Create a unique room ID using crypto
                const room = getSecretRoomId(sender, receiver);

                // Create a new message object
                const newMessage = {
                    senderId: sender,
                    text: content,
                    timestamp: timestamp || new Date()
                };

                // Find or create a chat between these users
                const participants = [sender, receiver];

                // Try to find existing chat
                let chat = await Chat.findOne({
                    participants: { $all: participants }
                });

                // If no chat exists, create a new one
                if (!chat) {
                    chat = new Chat({
                        participants,
                        messages: [newMessage]
                    });
                } else {
                    // Add message to existing chat
                    chat.messages.push(newMessage);
                }

                // Save the chat
                await chat.save();

                // Get the newly added message (last one in the array)
                const message = chat.messages[chat.messages.length - 1];

                // We can emit to both the individual user's room and the chat room
                console.log(`Emitting to room: ${receiver} and chat room: ${room}`);

                // Create the message payload
                const messagePayload = {
                    _id: message._id,
                    senderId: message.senderId,
                    text: message.text,
                    timestamp: message.timestamp
                };

                // Only emit to the recipient's room, not back to the sender
                // This prevents duplicate messages
                io.to(receiver).emit('receive_message', messagePayload);
            } catch (err) {
                console.error('Error in send_message handler:', err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initializeSocket;