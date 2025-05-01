import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connections: [],
  pendingRequests: [],
  sentRequests: [],
  loading: false,
  error: null,
};

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
    },
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    setSentRequests: (state, action) => {
      state.sentRequests = action.payload;
    },
    addConnection: (state, action) => {
      state.connections.push(action.payload);
      state.pendingRequests = state.pendingRequests.filter(
        (request) => request.id !== action.payload.id
      );
    },
    removeConnection: (state, action) => {
      state.connections = state.connections.filter(
        (connection) => connection.id !== action.payload
      );
    },
    addPendingRequest: (state, action) => {
      state.pendingRequests.push(action.payload);
    },
    removePendingRequest: (state, action) => {
      state.pendingRequests = state.pendingRequests.filter(
        (request) => request.id !== action.payload
      );
    },
    addSentRequest: (state, action) => {
      state.sentRequests.push(action.payload);
    },
    removeSentRequest: (state, action) => {
      state.sentRequests = state.sentRequests.filter(
        (request) => request.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setConnections,
  setPendingRequests,
  setSentRequests,
  addConnection,
  removeConnection,
  addPendingRequest,
  removePendingRequest,
  addSentRequest,
  removeSentRequest,
  setLoading,
  setError,
} = connectionSlice.actions;

export default connectionSlice.reducer;