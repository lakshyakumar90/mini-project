const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content cannot be empty'],
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: 5000
  },
  codeSnippet: {
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    }
  },
  type: {
    type: String,
    enum: ['update', 'project', 'collab'],
    default: 'update'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  openToCollab: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Create indexes for fast cursor pagination and sorting
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
