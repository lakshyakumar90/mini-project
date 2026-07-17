import { createSlice } from '@reduxjs/toolkit';
import connectionService from '@/services/connectionService';

const initialState = {
  connections: [],
  pendingRequests: [],
  sentRequests: [],
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: null,
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
      const item = action.payload;
      const id = item._id || item.id;
      if (!state.connections.some(c => (c._id || c.id) === id)) {
        state.connections.push(item);
      }
      state.pendingRequests = state.pendingRequests.filter(
        (request) => (request._id || request.id) !== id
      );
    },
    removeConnection: (state, action) => {
      const targetId = action.payload?._id || action.payload?.id || action.payload;
      state.connections = state.connections.filter(
        (connection) => (connection._id || connection.id) !== targetId
      );
    },
    addPendingRequest: (state, action) => {
      const item = action.payload;
      const id = item._id || item.id;
      if (!state.pendingRequests.some(r => (r._id || r.id) === id)) {
        state.pendingRequests.push(item);
      }
    },
    removePendingRequest: (state, action) => {
      const targetId = action.payload?._id || action.payload?.id || action.payload;
      state.pendingRequests = state.pendingRequests.filter(
        (request) => (request._id || request.id) !== targetId
      );
    },
    addSentRequest: (state, action) => {
      const item = action.payload;
      const id = item._id || item.id;
      if (!state.sentRequests.some(r => (r._id || r.id) === id)) {
        state.sentRequests.push(item);
      }
    },
    removeSentRequest: (state, action) => {
      const targetId = action.payload?._id || action.payload?.id || action.payload;
      state.sentRequests = state.sentRequests.filter(
        (request) => (request._id || request.id) !== targetId
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setActionLoading: (state, action) => {
      state.actionLoading = action.payload;
      state.actionError = null;
      state.actionSuccess = null;
    },
    setActionError: (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload;
    },
    setActionSuccess: (state, action) => {
      state.actionLoading = false;
      state.actionSuccess = action.payload;
    }
  },
});

// Action creators with silent parameter support to prevent UI loading flashes during background updates
export const fetchConnections = (silent = false) => async (dispatch) => {
  try {
    if (!silent) dispatch(setLoading(true));
    const response = await connectionService.getConnections();
    dispatch(setConnections(response.connections || response.connectedUsers || []));
    if (!silent) dispatch(setLoading(false));
    return response.connections || [];
  } catch (error) {
    if (!silent) dispatch(setError(error));
  }
};

export const fetchConnectionRequests = (silent = false) => async (dispatch) => {
  try {
    if (!silent) dispatch(setLoading(true));
    const response = await connectionService.getConnectionRequests();
    dispatch(setPendingRequests(response.requests || []));
    if (!silent) dispatch(setLoading(false));
    return response.requests || [];
  } catch (error) {
    if (!silent) dispatch(setError(error));
  }
};

export const fetchSentRequests = (silent = false) => async (dispatch) => {
  try {
    if (!silent) dispatch(setLoading(true));
    const response = await connectionService.getSentRequests();
    dispatch(setSentRequests(response.requests || []));
    if (!silent) dispatch(setLoading(false));
    return response.requests || [];
  } catch (error) {
    if (!silent) dispatch(setError(error));
  }
};

export const refreshNetworkState = (silent = true) => async (dispatch) => {
  await Promise.allSettled([
    dispatch(fetchConnections(silent)),
    dispatch(fetchConnectionRequests(silent)),
    dispatch(fetchSentRequests(silent)),
  ]);
};

export const sendRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.sendConnectionRequest(userId);
    dispatch(addSentRequest({ _id: userId, id: userId }));
    dispatch(setActionSuccess('Connection request sent successfully'));
    dispatch(fetchSentRequests(true));
    return { success: true, userId, fulfilled: true };
  } catch (error) {
    dispatch(setActionError(error));
    throw error;
  }
};

export const acceptRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.acceptConnectionRequest(userId);
    dispatch(removePendingRequest(userId));
    dispatch(addConnection({ _id: userId, id: userId }));
    dispatch(setActionSuccess('Connection request accepted'));
    dispatch(refreshNetworkState(true));
    return { success: true, userId, fulfilled: true };
  } catch (error) {
    dispatch(setActionError(error));
    throw error;
  }
};

export const rejectRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.rejectConnectionRequest(userId);
    dispatch(removePendingRequest(userId));
    dispatch(setActionSuccess('Connection request rejected'));
    dispatch(fetchConnectionRequests(true));
    return { success: true, userId, fulfilled: true };
  } catch (error) {
    dispatch(setActionError(error));
    throw error;
  }
};

export const removeExistingConnection = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.removeConnection(userId);
    dispatch(removeConnection(userId));
    dispatch(setActionSuccess('Connection removed successfully'));
    dispatch(fetchConnections(true));
    return { success: true, userId, fulfilled: true };
  } catch (error) {
    dispatch(setActionError(error));
    throw error;
  }
};

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
  setActionLoading,
  setActionError,
  setActionSuccess
} = connectionSlice.actions;

export default connectionSlice.reducer;