import { createApi } from './apiClient';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3333/api'}/notifications`;

const api = createApi(API_URL);

const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/?page=${page}&limit=${limit}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};

export default notificationService;
