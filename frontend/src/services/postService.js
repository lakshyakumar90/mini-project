import { createApi } from './apiClient';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3333/api'}/posts`;

const api = createApi(API_URL);

const postService = {
  getFeed: async (cursor = null, limit = 10, tab = 'recent', tag = null) => {
    let url = `/feed?limit=${limit}&tab=${tab}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    const response = await api.get(url);
    return response.data;
  },

  uploadPostImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/', postData);
    return response.data;
  },

  getPostById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await api.post(`/${id}/like`);
    return response.data;
  },

  addComment: async (id, content) => {
    const response = await api.post(`/${id}/comment`, { content });
    return response.data;
  },

  deleteComment: async (id, commentId) => {
    const response = await api.delete(`/${id}/comment/${commentId}`);
    return response.data;
  }
};

export default postService;
