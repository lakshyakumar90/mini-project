const Post = require('../models/Post');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');
const { notifyUser } = require('./notificationController');
const { getFileUrl, resolveImageUrl } = require('../middleware/upload');

// @desc    Get paginated posts feed using cursor
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const { cursor, limit = 10, tab = 'recent', tag } = req.query;
    const limitNum = Math.min(parseInt(limit) || 10, 30);

    // Build base query
    const query = {};

    // Filter by tag if requested
    if (tag && tag.trim() !== '') {
      query.tags = { $regex: tag.trim(), $options: 'i' };
    }

    // Apply cursor filter
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    let posts = [];

    if (tab === 'top') {
      // Top posts: liked most in last 7 days or overall, secondary sort by _id descending
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const topQuery = { ...query };
      if (!cursor) {
        topQuery.createdAt = { $gte: sevenDaysAgo };
      }

      posts = await Post.aggregate([
        { $match: topQuery },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: { likesCount: -1, _id: -1 } },
        { $limit: limitNum }
      ]);

      // Populate author and comment authors after aggregation
      posts = await Post.populate(posts, [
        { path: 'author', select: 'name email bio skills profilePicture role githubUsername location openToCollab' },
        { path: 'comments.author', select: 'name profilePicture' }
      ]);
    } else {
      // Recent posts: sorted chronologically by _id descending
      posts = await Post.find(query)
        .sort({ _id: -1 })
        .limit(limitNum)
        .populate('author', 'name email bio skills profilePicture role githubUsername location openToCollab')
        .populate('comments.author', 'name profilePicture');
    }

    const nextCursor = posts.length === limitNum ? posts[posts.length - 1]._id : null;

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        nextCursor,
        hasMore: posts.length === limitNum
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content, codeSnippet, type, tags, openToCollab, image } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    // Process tags array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const finalImage = req.file ? await resolveImageUrl(req.file, 'posts', 'posts') : (image || '');

    const newPost = await Post.create({
      author: req.user._id,
      content: content.trim(),
      codeSnippet: codeSnippet || { code: '', language: 'javascript' },
      type: type || 'update',
      tags: processedTags,
      openToCollab: Boolean(openToCollab),
      image: finalImage
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'name email bio skills profilePicture role githubUsername location openToCollab')
      .populate('comments.author', 'name profilePicture');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email bio skills profilePicture role githubUsername location openToCollab')
      .populate('comments.author', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete post by author
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      postId: req.params.id
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like on post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user._id);
    let isLiked = false;
    if (index === -1) {
      post.likes.push(req.user._id);
      isLiked = true;
    } else {
      post.likes.splice(index, 1);
      isLiked = false;
    }

    await post.save();

    if (isLiked) {
      notifyUser({
        recipient: post.author,
        sender: req.user._id,
        type: 'post_like',
        entityId: post._id,
        entityModel: 'Post',
        message: 'Liked your post'
      });
    }

    res.status(200).json({
      success: true,
      likes: post.likes,
      isLiked
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const newComment = {
      author: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    notifyUser({
      recipient: post.author,
      sender: req.user._id,
      type: 'post_comment',
      entityId: post._id,
      entityModel: 'Post',
      message: `Commented on your post: "${content.trim().substring(0, 30)}${content.trim().length > 30 ? '...' : ''}"`
    });

    const populatedPost = await Post.findById(post._id)
      .populate('comments.author', 'name profilePicture');

    res.status(201).json({
      success: true,
      comments: populatedPost.comments
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if user is comment author or post author
    if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      commentId: req.params.commentId
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Upload post image file
// @route   POST /api/posts/upload/image
// @access  Private
const uploadPostImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = await resolveImageUrl(req.file, 'posts', 'posts');

    res.status(200).json({
      success: true,
      message: 'Post image uploaded successfully',
      imageUrl: fileUrl
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFeed,
  createPost,
  uploadPostImageFile,
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
};
