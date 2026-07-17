import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '@/services/postService';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ cursor = null, limit = 10, tab = 'recent', tag = null, append = false }, { rejectWithValue }) => {
    try {
      const response = await postService.getFeed(cursor, limit, tab, tag);
      return { ...response, append };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const createPostThunk = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response.post;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const deletePostThunk = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const toggleLikeThunk = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const response = await postService.toggleLike(postId);
      return { postId, likes: response.likes, isLiked: response.isLiked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

export const addCommentThunk = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await postService.addComment(postId, content);
      return { postId, comments: response.comments };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteCommentThunk = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await postService.deleteComment(postId, commentId);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const initialState = {
  posts: [],
  nextCursor: null,
  hasMore: true,
  loading: false,
  loadingMore: false,
  error: null,
  currentTab: 'recent',
  selectedTag: null
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setTab: (state, action) => {
      state.currentTab = action.payload;
      state.posts = [];
      state.nextCursor = null;
      state.hasMore = true;
    },
    setTag: (state, action) => {
      state.selectedTag = action.payload;
      state.posts = [];
      state.nextCursor = null;
      state.hasMore = true;
    },
    clearPosts: (state) => {
      return initialState;
    },
    // Optimistic like update
    optimisticLikeToggle: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post && Array.isArray(post.likes)) {
        const index = post.likes.indexOf(userId);
        if (index === -1) {
          post.likes.push(userId);
        } else {
          post.likes.splice(index, 1);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPosts
      .addCase(fetchPosts.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        if (action.payload.append) {
          state.posts = [...state.posts, ...action.payload.posts];
        } else {
          state.posts = action.payload.posts;
        }
        state.nextCursor = action.payload.pagination.nextCursor;
        state.hasMore = action.payload.pagination.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // createPost
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // deletePost
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      })
      // toggleLike
      .addCase(toggleLikeThunk.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.likes = action.payload.likes;
        }
      })
      // addComment
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
      })
      // deleteComment
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.postId);
        if (post && Array.isArray(post.comments)) {
          post.comments = post.comments.filter(c => c._id !== action.payload.commentId);
        }
      });
  }
});

export const { setTab, setTag, clearPosts, optimisticLikeToggle } = postSlice.actions;
export default postSlice.reducer;
