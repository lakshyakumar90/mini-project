const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Message routes
router.get('/:userId', getMessages);
router.post('/:userId', sendMessage);

module.exports = router;