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
                const { sender, receiver, content, timestamp, _id } = data;
                console.log(`Message sent from ${sender} to ${receiver}:`, content);

                // Validate required fields
                if (!sender || !receiver || !content) {
                    console.log('Invalid message data:', data);
                    return;
                }

                // Check if users are connected
                const connection = await Connection.findOne({
                    $or: [
                        { requester: sender, recipient: receiver, status: 'accepted' },
                        { requester: receiver, recipient: sender, status: 'accepted' }
                    ]
                });

                if (!connection) {
                    console.log('Users are not connected, message rejected');
                    socket.emit('message_error', { error: 'Users are not connected' });
                    return;
                }

                // Create a new message object
                const newMessage = {
                    senderId: sender,
                    text: content.trim(),
                    timestamp: timestamp ? new Date(timestamp) : new Date()
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
                const savedMessage = chat.messages[chat.messages.length - 1];

                // Create the message payload for the receiver
                const messagePayload = {
                    _id: savedMessage._id,
                    senderId: savedMessage.senderId,
                    text: savedMessage.text,
                    timestamp: savedMessage.timestamp,
                    sender: savedMessage.senderId // For compatibility
                };

                console.log(`Emitting message to receiver: ${receiver}`);

                // Only emit to the recipient's room, not back to the sender
                // This prevents duplicate messages
                io.to(receiver).emit('receive_message', messagePayload);

                // Confirm message sent to sender
                socket.emit('message_sent', {
                    _id: savedMessage._id,
                    tempId: _id, // Original temp ID for frontend matching
                    timestamp: savedMessage.timestamp
                });

            } catch (err) {
                console.error('Error in send_message handler:', err);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initializeSocket;