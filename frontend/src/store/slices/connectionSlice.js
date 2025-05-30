import { createSlice } from '@reduxjs/toolkit';
import connectionService from '@/services/connectionService';
import { getCurrentUser } from './authSlice';

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

// Action creators
export const fetchConnections = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await connectionService.getConnections();
    dispatch(setConnections(response.connections || response.connectedUsers || []));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error));
  }
};

export const fetchConnectionRequests = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await connectionService.getConnectionRequests();
    dispatch(setPendingRequests(response.requests || []));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error));
  }
};

export const sendRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    const response = await connectionService.sendConnectionRequest(userId);
    dispatch(setActionSuccess('Connection request sent successfully'));
    dispatch(getCurrentUser());
  } catch (error) {
    dispatch(setActionError(error));
  }
};

export const acceptRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.acceptConnectionRequest(userId);
    dispatch(setActionSuccess('Connection request accepted'));
    dispatch(fetchConnections());
    dispatch(fetchConnectionRequests());
  } catch (error) {
    dispatch(setActionError(error));
  }
};

export const rejectRequest = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.rejectConnectionRequest(userId);
    dispatch(setActionSuccess('Connection request rejected'));
    dispatch(fetchConnectionRequests());
  } catch (error) {
    dispatch(setActionError(error));
  }
};

export const removeExistingConnection = (userId) => async (dispatch) => {
  try {
    dispatch(setActionLoading(true));
    await connectionService.removeConnection(userId);
    dispatch(setActionSuccess('Connection removed successfully'));
    dispatch(fetchConnections());
  } catch (error) {
    dispatch(setActionError(error));
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