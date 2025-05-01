const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message cannot be empty']
  },
  room: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create index for faster queries
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ room: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;