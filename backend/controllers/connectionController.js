const User = require('../models/User');
const Connection = require('../models/Connection');

// @desc    Send connection request to another user
// @route   POST /api/connections/request/:userId
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const receiverUser = await User.findById(userId);
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if trying to connect with self
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already connected with this user' });
      } else if (existingConnection.status === 'pending') {
        if (existingConnection.requester.toString() === req.user._id.toString()) {
          return res.status(400).json({ success: false, message: 'Connection request already sent' });
        } else {
          return res.status(400).json({ success: false, message: 'This user has already sent you a connection request' });
        }
      }
    }

    // Create new connection request
    await Connection.create({
      requester: req.user._id,
      recipient: userId,
      status: 'pending'
    });

    res.status(200).json({ success: true, message: 'Connection request sent successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Accept connection request
// @route   POST /api/connections/accept/:userId
// @access  Private
const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if request exists
    const connectionRequest = await Connection.findOne({
      requester: userId,
      recipient: req.user._id,
      status: 'pending'
    });

    if (!connectionRequest) {
      return res.status(400).json({ success: false, message: 'No connection request from this user' });
    }

    // Update connection status to accepted
    connectionRequest.status = 'accepted';
    await connectionRequest.save();

    res.status(200).json({ success: true, message: 'Connection request accepted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reject connection request
// @route   POST /api/connections/reject/:userId
// @access  Private
const rejectConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if request exists
    const connectionRequest = await Connection.findOne({
      requester: userId,
      recipient: req.user._id,
      status: 'pending'
    });

    if (!connectionRequest) {
      return res.status(400).json({ success: false, message: 'No connection request from this user' });
    }

    // Update connection status to rejected or delete the request
    // Option 1: Update status to rejected
    connectionRequest.status = 'rejected';
    await connectionRequest.save();

    // Option 2: Delete the request (uncomment to use this approach instead)
    // await Connection.findByIdAndDelete(connectionRequest._id);

    res.status(200).json({ success: true, message: 'Connection request rejected' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all connection requests
// @route   GET /api/connections/requests
// @access  Private
const getConnectionRequests = async (req, res) => {
  try {
    const connectionRequests = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name email bio skills profilePicture');

    res.status(200).json({
      success: true,
      requests: connectionRequests.map(request => request.requester)
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all connections
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    // Find connections where the user is either the requester or recipient
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name email bio skills profilePicture');

    // Map the connections to return the connected user (not the current user)
    const connectedUsers = connections.map(connection => {
      const isRequester = connection.requester._id.toString() === req.user._id.toString();
      return isRequester ? connection.recipient : connection.requester;
    });

    res.status(200).json({
      success: true,
      connections: connectedUsers
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:userId
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const connectionUser = await User.findById(userId);
    if (!connectionUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the connection
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId, status: 'accepted' },
        { requester: userId, recipient: req.user._id, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(400).json({ success: false, message: 'Not connected with this user' });
    }

    // Remove the connection
    await Connection.findByIdAndDelete(connection._id);

    res.status(200).json({ success: true, message: 'Connection removed successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export all controller functions
module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnections,
  removeConnection
};