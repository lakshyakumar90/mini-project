import { createApi } from './apiClient';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = createApi(API_URL);

export const submitContactMessage = async (data) => {
  try {
    const response = await api.post('/contact', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message || 'Something went wrong' };
  }
};
