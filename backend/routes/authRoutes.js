const express = require('express');
const router = express.Router();
const { githubLogin, githubCallback, syncGitHub } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// GitHub OAuth routes (with rate limiting against abuse)
router.get('/github', authLimiter, githubLogin);
router.get('/github/callback', authLimiter, githubCallback);

// GitHub profile sync route (protected)
router.post('/sync-github', protect, syncGitHub);

module.exports = router;
