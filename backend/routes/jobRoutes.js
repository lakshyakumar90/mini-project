const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  getJobById,
  applyToJob,
  updateApplicationStatus,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { jobLimiter } = require('../middleware/rateLimiter');
const { uploadDocument } = require('../middleware/upload');

router.use(protect);

router.get('/', getJobs);
router.post('/', jobLimiter, createJob);
router.get('/:id', getJobById);
router.post('/:id/apply', jobLimiter, uploadDocument.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 5 }
]), applyToJob);
router.put('/:id/application/:applicationId/status', updateApplicationStatus);
router.delete('/:id', deleteJob);

module.exports = router;
