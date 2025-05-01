const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

// Protected routes (authentication required)
router.use(protect); // Apply protection middleware to all routes below this line

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/feed', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
