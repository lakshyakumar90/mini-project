import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || '/api';


const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


const getConnections = async () => {
  try {
    const response = await api.get('/connections');
    console.log('API response from getConnections:', response.data);

    
    if (response.data && response.data.success) {
      if (!response.data.connections) {
        console.warn('No connections array in API response:', response.data);
        return { success: true, connections: [] };
      }
      return response.data;
    } else {
      console.error('Invalid API response format:', response.data);
      return { success: true, connections: [] };
    }
  } catch (error) {
    console.error('Error in getConnections:', error);
    throw error.response?.data?.message || 'Failed to fetch connections';
  }
};


const getConnectionRequests = async () => {
  try {
    const response = await api.get('/connections/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch connection requests';
  }
};


const sendConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/request/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send connection request';
  }
};


const acceptConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/accept/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to accept connection request';
  }
};


const rejectConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/reject/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reject connection request';
  }
};


const removeConnection = async (userId) => {
  try {
    const response = await api.delete(`/connections/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to remove connection';
  }
};

const connectionService = {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
};

export default connectionService;


