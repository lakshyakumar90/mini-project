import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || '/api';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


const getMessages = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
    console.log('Messages response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error.response?.data?.message || 'Failed to fetch messages';
  }
};


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


const messageService = {
  getMessages,
  sendMessage,
};

export default messageService;


