import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Get all connections
const getConnections = async () => {
  try {
    const response = await api.get('/connections');
    console.log('API response from getConnections:', response.data);

    // Ensure we have a valid response with connections
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

// Get all connection requests
const getConnectionRequests = async () => {
  try {
    const response = await api.get('/connections/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch connection requests';
  }
};

// Send a connection request
const sendConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/request/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send connection request';
  }
};

// Accept a connection request
const acceptConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/accept/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to accept connection request';
  }
};

// Reject a connection request
const rejectConnectionRequest = async (userId) => {
  try {
    const response = await api.post(`/connections/reject/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reject connection request';
  }
};

// Remove a connection
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
