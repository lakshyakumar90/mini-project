import axios from 'axios';

// Use relative path instead of hardcoded URL
const API_URL = '/api';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Get messages between current user and another user
const getMessages = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error.response?.data?.message || 'Failed to fetch messages';
  }
};

// Send a message to another user
const sendMessage = async (userId, content) => {
  try {
    const response = await api.post(`/messages/${userId}`, { content });
    console.log('Message sent response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error.response?.data?.message || 'Failed to send message';
  }
};

// Get unread message count
const getUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error.response?.data?.message || 'Failed to fetch unread count';
  }
};

const messageService = {
  getMessages,
  sendMessage,
  getUnreadCount,
};

export default messageService;

