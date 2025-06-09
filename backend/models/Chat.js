const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    messages: [messageSchema],
    lastMessage: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add middleware to prevent duplicate messages and update lastMessage
chatSchema.pre('save', function(next) {
    if (this.isModified('messages') && this.messages.length > 0) {
        // Get the last message that's being added
        const newMessage = this.messages[this.messages.length - 1];

        // Check if this is a duplicate (same sender, same text, within 2 seconds)
        const duplicates = this.messages.slice(0, -1).filter(msg =>
            msg.senderId.toString() === newMessage.senderId.toString() &&
            msg.text === newMessage.text &&
            Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000
        );

        if (duplicates.length > 0) {
            // Remove the duplicate message
            this.messages.pop();
            console.log('Prevented duplicate message:', newMessage.text);
        } else {
            // Update lastMessage timestamp
            this.lastMessage = newMessage.timestamp;
        }
    }
    next();
});

// Create indexes for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;

