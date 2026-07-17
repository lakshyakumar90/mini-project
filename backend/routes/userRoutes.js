const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  uploadAvatarImage,
  uploadCoverImage,
  getAllUsers,
  getUserById,
  searchUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, searchLimiter } = require('../middleware/rateLimiter');
const { uploadAvatar, uploadCover } = require('../middleware/upload');

// Public routes (no authentication required)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/logout', logout);

// Protected routes (authentication required)
router.use(protect); // Apply protection middleware to all routes below this line

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload/avatar', uploadAvatar.single('image'), uploadAvatarImage);
router.post('/upload/cover', uploadCover.single('image'), uploadCoverImage);
router.get('/feed', getAllUsers);
router.get('/search', searchLimiter, searchUsers);
router.get('/:id', getUserById);

module.exports = router;
