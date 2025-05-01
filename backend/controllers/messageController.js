const Chat = require('../models/Chat');
const User = require('../models/User');
const Connection = require('../models/Connection');

// @desc    Get chat messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Find chat between these two users
    const participants = [currentUserId.toString(), userId].sort();

    // Get chat with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Find the chat between these users
    const chat = await Chat.findOne({
      participants: { $all: participants }
    }).populate('participants', 'name profilePicture');

    if (!chat) {
      return res.status(200).json({
        success: true,
        messages: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    }

    // Get total messages count
    const total = chat.messages.length;

    // Apply pagination to messages
    // Note: For MongoDB array slicing, we need to reverse the logic
    // since we want the most recent messages
    const startIdx = Math.max(0, total - (page * limit));
    const endIdx = Math.max(0, total - ((page - 1) * limit));

    // Get the messages for this page (in reverse order for most recent first)
    const paginatedMessages = chat.messages
      .slice(startIdx, endIdx)
      .reverse();

    // Format messages for the client
    const formattedMessages = paginatedMessages.map(msg => ({
      _id: msg._id,
      senderId: msg.senderId,
      text: msg.text,
      timestamp: msg.timestamp
    }));

    console.log('Sending messages to client:', formattedMessages);

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Send a message to another user
// @route   POST /api/messages/:userId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if users are connected
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId, status: 'accepted' },
        { requester: userId, recipient: req.user._id, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are connected with'
      });
    }

    // Create a new message object
    const newMessage = {
      senderId: currentUserId,
      text: content,
      timestamp: new Date()
    };

    // Find or create a chat between these users
    const participants = [currentUserId, userId];

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

    res.status(201).json({
      success: true,
      message: {
        _id: message._id,
        senderId: message.senderId,
        text: message.text,
        timestamp: message.timestamp
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all chats where the current user is a participant
    const chats = await Chat.find({
      participants: currentUserId
    });

    // Count unread messages (messages not from the current user)
    let unreadCount = 0;

    // For each chat, count messages not from the current user
    chats.forEach(chat => {
      // We don't have a 'read' field in the new schema, so we'll need to implement
      // that feature separately if needed. For now, we'll return 0.
      unreadCount = 0;
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export all controller functions
module.exports = {
  getMessages,
  sendMessage,
  getUnreadCount
};