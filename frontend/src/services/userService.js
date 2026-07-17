import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || '/api';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'An error occurred during registration';
  }
};


const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Invalid email or password';
  }
};


const logout = async () => {
  try {
    await api.get('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};


const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get user profile';
  }
};


const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

const getFeed = async (page = 1, limit = 10, skills = null) => {
  try {
    let url = `/users/feed?page=${page}&limit=${limit}`;
    if (skills && skills.length > 0) {
      url += `&skills=${skills.join(',')}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch feed';
  }
};

const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch user';
  }
};

const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to search users';
  }
};

const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to upload avatar';
  }
};

const uploadCover = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to upload cover image';
  }
};

const userService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  uploadCover,
  getFeed,
  getUserById,
  searchUsers,
};

export default userService;

