import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/services/authService';

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Assuming register returns { user: { ..., token: '...' } }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Assuming login returns { user: { ..., token: '...' } }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null; // Indicate successful logout
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response.user; // Assuming updateProfile returns { user: { ... } }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      // Assuming getCurrentUser returns { user: { ..., token: '...' } } or null/error if not authenticated
      return response;
    } catch (error) {
      // If getCurrentUser fails, it likely means the user is not authenticated
      return rejectWithValue(error);
    }
  }
);


const initialState = {
  user: null,
  token: null, // Store token if your auth service provides it
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Optional: A reducer to manually set user/token if needed (e.g., from localStorage on app load)
    setAuthData: (state, action) => {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.isAuthenticated = !!action.payload.user; // isAuthenticated is true if user exists
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token; // Assuming token is returned here
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })

      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token; // Assuming token is returned here
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false; // Ensure loading is false after logout
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on the server, we might want to clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload; // Still show the error
        state.loading = false;
      })


      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Merge updated user data, keep existing token
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Current User cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        // If payload has user, set auth state, otherwise clear it
        if (action.payload && action.payload.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token || state.token; // Update token if provided, otherwise keep existing
          state.error = null;
        } else {
          // User is not authenticated or session expired
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error = null; // No error, just not authenticated
        }
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // Set error only if it's a real error, not just "not authenticated"
        // You might need to inspect action.payload structure from authService
        state.error = action.payload;
      });
  },
});

export const { clearError, setAuthData } = authSlice.actions;
export default authSlice.reducer;