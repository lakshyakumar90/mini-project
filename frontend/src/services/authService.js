import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Register user
const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'An error occurred during registration';
  }
};

// Login user
const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Invalid email or password';
  }
};

// Logout user
const logout = async () => {
  try {
    await api.get('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get current user profile
const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get user profile';
  }
};

// Update user profile
const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
};

export default authService;
