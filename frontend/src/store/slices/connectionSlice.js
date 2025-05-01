import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import connectionService from '@/services/connectionService';
import { getCurrentUser } from './authSlice';

// Async thunks
export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getConnections();
      console.log('Raw API response from fetchConnections:', response);
      return response;
    } catch (error) {
      console.error('Error in fetchConnections thunk:', error);
      return rejectWithValue(error);
    }
  }
);

export const fetchConnectionRequests = createAsyncThunk(
  'connections/fetchConnectionRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getConnectionRequests();
      console.log('API Response for connection requests:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const sendRequest = createAsyncThunk(
  'connections/sendRequest',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await connectionService.sendConnectionRequest(userId);
      // Refresh user data to update sent requests
      dispatch(getCurrentUser());
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  'connections/acceptRequest',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await connectionService.acceptConnectionRequest(userId);
      // Refresh connections and requests
      dispatch(fetchConnections());
      dispatch(fetchConnectionRequests());
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'connections/rejectRequest',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await connectionService.rejectConnectionRequest(userId);
      // Refresh connection requests
      dispatch(fetchConnectionRequests());
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeExistingConnection = createAsyncThunk(
  'connections/removeConnection',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await connectionService.removeConnection(userId);
      // Refresh connections
      dispatch(fetchConnections());
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

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
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  // Add extraReducers to handle async thunks
  extraReducers: (builder) => {
    builder
      // Fetch connections
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        console.log('Connections API response:', action.payload);
        state.loading = false;
        // Handle both response formats: connections or connectedUsers
        state.connections = action.payload.connections || action.payload.connectedUsers || [];
        console.log('Updated connections in state:', state.connections);
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch connection requests
      .addCase(fetchConnectionRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnectionRequests.fulfilled, (state, action) => {
        console.log('Action payload in reducer:', action.payload);
        state.loading = false;
        state.pendingRequests = action.payload.requests || [];
        console.log('Updated pendingRequests in state:', state.pendingRequests);
      })
      .addCase(fetchConnectionRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send connection request
      .addCase(sendRequest.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(sendRequest.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Connection request sent successfully';
        // We don't update sentRequests here because getCurrentUser will refresh it
      })
      .addCase(sendRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Accept connection request
      .addCase(acceptRequest.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(acceptRequest.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Connection request accepted';
        // We don't update connections or pendingRequests here because the thunk will refresh them
      })
      .addCase(acceptRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Reject connection request
      .addCase(rejectRequest.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(rejectRequest.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Connection request rejected';
        // We don't update pendingRequests here because the thunk will refresh it
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      // Remove connection
      .addCase(removeExistingConnection.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = null;
      })
      .addCase(removeExistingConnection.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionSuccess = 'Connection removed successfully';
        // We don't update connections here because the thunk will refresh it
      })
      .addCase(removeExistingConnection.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
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