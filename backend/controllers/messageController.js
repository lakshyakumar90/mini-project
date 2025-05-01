const Message = require('../models/Message');
const User = require('../models/User');
const Connection = require('../models/Connection');

// @desc    Get chat messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Create a unique room ID (sorted to ensure consistency)
    const participants = [currentUserId.toString(), userId].sort();
    const room = participants.join('-');

    // Get messages for this room with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');

    // Mark messages as read
    await Message.updateMany(
      { room, receiver: currentUserId, read: false },
      { read: true }
    );

    const total = await Message.countDocuments({ room });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
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

    // Create a unique room ID (sorted to ensure consistency)
    const participants = [currentUserId.toString(), userId].sort();
    const room = participants.join('-');

    // Create and save the message
    const message = await Message.create({
      sender: currentUserId,
      receiver: userId,
      content,
      room
    });

    // Populate sender and receiver info
    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');

    res.status(201).json({
      success: true,
      message
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
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      read: false
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