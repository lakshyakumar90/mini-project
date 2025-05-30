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


const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgotpassword', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to process password reset request';
  }
};


const resetPassword = async (resetToken, password) => {
  try {
    const response = await api.put(`/users/resetpassword/${resetToken}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reset password';
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getFeed,
  getUserById,
  forgotPassword,
  resetPassword,
};

export default authService;

