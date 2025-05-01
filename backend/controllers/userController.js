const User = require('../models/User');
const Connection = require('../models/Connection');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Send token as cookie and in response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Cannot be accessed by client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
    sameSite: 'strict'
  };

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  // Return response
  res.status(statusCode).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token // Include token in response for backward compatibility
    }
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Send token response with cookie
      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    console.log("hey")
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Send token response with cookie
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get connections
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name email profilePicture');

    // Get connection requests
    const connectionRequests = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name email profilePicture');

    // Get sent requests
    const sentRequests = await Connection.find({
      requester: req.user._id,
      status: 'pending'
    }).populate('recipient', 'name email profilePicture');

    // Map connections to return the connected user (not the current user)
    const connectedUsers = connections.map(connection => {
      const isRequester = connection.requester._id.toString() === req.user._id.toString();
      return isRequester ? connection.recipient : connection.requester;
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        connections: connectedUsers,
        connectionRequests: connectionRequests.map(request => request.requester),
        sentRequests: sentRequests.map(request => request.recipient)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, githubUrl, linkedinUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        profilePicture: updatedUser.profilePicture,
        githubUrl: updatedUser.githubUrl,
        linkedinUrl: updatedUser.linkedinUrl
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (for discovery)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    // Exclude current user and get users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by skills if provided
    const skillsFilter = req.query.skills ? { skills: { $in: req.query.skills.split(',') } } : {};

    const users = await User.find({
      _id: { $ne: req.user._id },
      ...skillsFilter
    })
      .select('name email bio skills profilePicture')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({
      _id: { $ne: req.user._id },
      ...skillsFilter
    });

    res.status(200).json({
      success: true,
      users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email bio skills profilePicture githubUrl linkedinUrl');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/users/logout
// @access  Public
const logout = (req, res) => {
  // Set cookie to expire in 10 seconds
  res.cookie('jwt', 'logged_out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Export all controller functions
module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
};