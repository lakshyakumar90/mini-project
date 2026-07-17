const express = require('express');
const router = express.Router();
const {
  getFeed,
  createPost,
  uploadPostImageFile,
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { postLimiter } = require('../middleware/rateLimiter');
const { uploadPostImage } = require('../middleware/upload');

router.use(protect);

router.get('/feed', getFeed);
router.post('/upload/image', uploadPostImage.single('image'), uploadPostImageFile);
router.post('/', postLimiter, uploadPostImage.single('image'), createPost);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.post('/:id/like', toggleLike);
router.post('/:id/comment', addComment);
router.delete('/:id/comment/:commentId', deleteComment);

module.exports = router;
