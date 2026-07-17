const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Message routes
router.get('/conversations/list', getConversations);
router.get('/:userId', getMessages);
router.post('/:userId', sendMessage);

module.exports = router;