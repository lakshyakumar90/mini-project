const rateLimit = require('express-rate-limit');

// Helper to format standard JSON error response when rate limit is hit
const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.'
    }
  });
};

// Auth endpoints (login, signup, OAuth sync) - 15 attempts per 15 minutes
const authLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  'Too many login/register attempts from this IP, please try again after 15 minutes.'
);

// Connection requests - 30 requests per hour
const connectionLimiter = createLimiter(
  60 * 60 * 1000,
  30,
  'Connection request limit reached. Please try again later.'
);

// Search endpoints - 60 requests per 5 minutes
const searchLimiter = createLimiter(
  5 * 60 * 1000,
  60,
  'Search rate limit exceeded. Please slow down.'
);

// Post creation - 20 posts per hour
const postLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'You are posting too frequently. Please try again later.'
);

// Job/Gig posting - 10 jobs per hour
const jobLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Job posting limit exceeded. Please try again later.'
);

module.exports = {
  authLimiter,
  connectionLimiter,
  searchLimiter,
  postLimiter,
  jobLimiter
};
