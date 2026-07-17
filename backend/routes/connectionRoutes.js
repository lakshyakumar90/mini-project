const express = require('express');
const router = express.Router();
const { 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  getConnectionRequests, 
  getSentRequests,
  getConnections,
  removeConnection
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');
const { connectionLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(protect);

// Connection requests
router.post('/request/:userId', connectionLimiter, sendConnectionRequest);
router.post('/accept/:userId', acceptConnectionRequest);
router.post('/reject/:userId', rejectConnectionRequest);
router.get('/requests', getConnectionRequests);
router.get('/sent', getSentRequests);

// Connections management
router.get('/', getConnections);
router.delete('/:userId', removeConnection);

module.exports = router;