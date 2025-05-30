import { createSlice } from '@reduxjs/toolkit';
import authService from '@/services/userService';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  passwordResetSuccess: false,
  passwordResetToken: null,
  passwordResetError: null,
  passwordResetLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Auth state management
    setAuthData: (state, action) => {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.isAuthenticated = !!action.payload.user;
      state.loading = false;
      state.error = null;
    },
    clearAuthData: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Password reset states
    setPasswordResetState: (state, action) => {
      state.passwordResetSuccess = action.payload.success || false;
      state.passwordResetToken = action.payload.token || null;
      state.passwordResetError = action.payload.error || null;
      state.passwordResetLoading = action.payload.loading || false;
    },
    clearPasswordResetState: (state) => {
      state.passwordResetSuccess = false;
      state.passwordResetToken = null;
      state.passwordResetError = null;
      state.passwordResetLoading = false;
    },
    
    // Profile update
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  }
});

// Action creators
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.register(userData);
    dispatch(setAuthData(response));
    return response;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const loginUser = ({ email, password }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.login(email, password);
    dispatch(setAuthData(response));
    return response;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await authService.logout();
    dispatch(clearAuthData());
    return null;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const updateUserProfile = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.updateProfile(userData);
    dispatch(updateUserProfile(response.user));
    return response.user;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const forgotPasswordRequest = (email) => async (dispatch) => {
  try {
    dispatch(setPasswordResetState({ loading: true }));
    const response = await authService.forgotPassword(email);
    dispatch(setPasswordResetState({ 
      success: true, 
      loading: false 
    }));
    return response;
  } catch (error) {
    dispatch(setPasswordResetState({ 
      error: error, 
      loading: false 
    }));
    throw error;
  }
};

export const resetPasswordWithToken = ({ resetToken, password }) => async (dispatch) => {
  try {
    dispatch(setPasswordResetState({ loading: true }));
    const response = await authService.resetPassword(resetToken, password);
    dispatch(setPasswordResetState({ 
      success: true, 
      loading: false 
    }));
    return response;
  } catch (error) {
    dispatch(setPasswordResetState({ 
      error: error, 
      loading: false 
    }));
    throw error;
  }
};

export const getCurrentUser = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.getCurrentUser();
    dispatch(setAuthData(response));
    return response;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const {
  setAuthData,
  clearAuthData,
  setLoading,
  setError,
  clearError,
  setPasswordResetState,
  clearPasswordResetState,
  updateUserProfile: updateUserProfileAction
} = authSlice.actions;

export default authSlice.reducer;