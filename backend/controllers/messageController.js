const Chat = require('../models/Chat');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Job = require('../models/Job');

// @desc    Get chat messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Validate userId
    if (!userId || userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find chat between these two users
    const participants = [currentUserId.toString(), userId];

    // Get chat with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

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

    // Mark messages sent by the other user (userId) to current user as 'read'
    let hasUnread = false;
    chat.messages.forEach(msg => {
      if (msg && msg.senderId.toString() === userId.toString() && msg.status !== 'read') {
        msg.status = 'read';
        hasUnread = true;
      }
    });
    if (hasUnread) {
      await chat.save();
      try {
        const socketUtil = require('../utils/socket');
        if (socketUtil.getIO) {
          const io = socketUtil.getIO();
          if (io) {
            io.to(userId.toString()).emit('messages_read', {
              readerId: currentUserId.toString(),
              chatId: currentUserId.toString()
            });
          }
        }
      } catch (err) {
        console.error('Socket emit error on read messages:', err);
      }
    }

    // Sort messages by timestamp (oldest first for proper order)
    const sortedMessages = chat.messages.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Apply pagination - get the specific batch for this page
    const startIdx = Math.max(0, total - (page * limit));
    const endIdx = Math.max(0, total - ((page - 1) * limit));

    // Get the messages for this page
    const paginatedMessages = sortedMessages.slice(startIdx, endIdx);

    // Format messages for the client
    const formattedMessages = paginatedMessages.map(msg => ({
      _id: msg._id,
      senderId: msg.senderId,
      text: msg.text,
      timestamp: msg.timestamp,
      sender: msg.senderId, // For compatibility
      status: msg.status || 'sent'
    }));

    console.log(`Sending ${formattedMessages.length} messages to client for chat with ${userId}`);

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
    console.error('Error fetching messages:', error);
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

    // Check if an active chat with prior messages already exists first for high performance
    let canMessage = false;
    let existingChat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    });
    if (existingChat) {
      canMessage = true;
    } else {
      const connection = await Connection.findOne({
        $or: [
          { requester: currentUserId, recipient: userId, status: 'accepted' },
          { requester: userId, recipient: currentUserId, status: 'accepted' }
        ]
      });
      if (connection) {
        canMessage = true;
      } else {
        // Check if sender is job poster or applicant and the other party applied/posted
        const job = await Job.findOne({
          $or: [
            { postedBy: currentUserId, 'applications.applicant': userId },
            { postedBy: userId, 'applications.applicant': currentUserId }
          ],
          'applications.status': { $in: ['pending', 'reviewed', 'accepted'] }
        });
        if (job) {
          canMessage = true;
        }
      }
    }

    if (!canMessage) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you are connected with, or applicants/posters for active job applications'
      });
    }

    let initialStatus = 'sent';
    try {
      const socketUtil = require('../utils/socket');
      if (socketUtil.localPresenceMap && socketUtil.localPresenceMap.has(userId.toString()) && socketUtil.localPresenceMap.get(userId.toString()).socketIds.size > 0) {
        initialStatus = 'delivered';
      }
    } catch (err) {
      console.error('Socket status check error:', err);
    }

    // Create a new message object
    const newMessage = {
      senderId: currentUserId,
      text: content,
      timestamp: new Date(),
      status: initialStatus
    };

    let chat = existingChat;
    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, userId],
        messages: [newMessage]
      });
    } else {
      chat.messages.push(newMessage);
    }

    // Save the chat
    await chat.save();

    // Get the newly added message (last one in the array)
    const message = chat.messages[chat.messages.length - 1];

    // Emit receive_message over socket to the receiver for real-time delivery when sent via API
    try {
      const socketUtil = require('../utils/socket');
      const io = socketUtil.getIO();
      if (io) {
        const messagePayload = {
          _id: message._id,
          senderId: message.senderId,
          text: message.text,
          timestamp: message.timestamp,
          sender: message.senderId,
          status: message.status || initialStatus
        };
        io.to(userId.toString()).emit('receive_message', messagePayload);
        io.to(currentUserId.toString()).emit('message_sent', {
          _id: message._id,
          tempId: req.body.tempId || req.body._id || message._id,
          timestamp: message.timestamp,
          status: message.status || initialStatus
        });
      }
    } catch (socketEmitErr) {
      console.warn('Could not emit real-time message from controller:', socketEmitErr.message);
    }

    res.status(201).json({
      success: true,
      message: {
        _id: message._id,
        senderId: message.senderId,
        text: message.text,
        timestamp: message.timestamp,
        status: message.status || initialStatus
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all active conversations/chat partners for current user
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all chats where current user is a participant
    const chats = await Chat.find({
      participants: currentUserId
    }).populate('participants', 'name profilePicture email bio role');

    const partners = [];
    const seenIds = new Set([currentUserId.toString()]);

    // Sort chats by most recent message
    const sortedChats = chats.sort((a, b) => {
      const lastA = a.messages && a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(0);
      const lastB = b.messages && b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(0);
      return lastB - lastA;
    });

    for (const chat of sortedChats) {
      if (chat.participants && Array.isArray(chat.participants)) {
        for (const p of chat.participants) {
          if (p && p._id && !seenIds.has(p._id.toString())) {
            seenIds.add(p._id.toString());
            const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            partners.push({
              _id: p._id,
              name: p.name || 'Unknown User',
              profilePicture: p.profilePicture || '',
              email: p.email || '',
              bio: p.bio || (p.role ? `Role: ${p.role}` : ''),
              role: p.role || '',
              lastMessageText: lastMessage ? lastMessage.text : null,
              lastMessageTime: lastMessage ? lastMessage.timestamp : null
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      conversations: partners
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export all controller functions
module.exports = {
  getMessages,
  sendMessage,
  getConversations
};