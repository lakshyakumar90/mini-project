const express = require('express');
const router = express.Router();
const { 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  getConnectionRequests, 
  getConnections,
  removeConnection
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Connection requests
router.post('/request/:userId', sendConnectionRequest);
router.post('/accept/:userId', acceptConnectionRequest);
router.post('/reject/:userId', rejectConnectionRequest);
router.get('/requests', getConnectionRequests);

// Connections management
router.get('/', getConnections);
router.delete('/:userId', removeConnection);

module.exports = router;