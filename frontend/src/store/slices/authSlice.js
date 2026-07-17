import { createSlice } from '@reduxjs/toolkit';
import authService from '@/services/userService';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  isAuthChecking: true,
  error: null,
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
      state.isAuthChecking = false;
      state.error = null;
    },
    clearAuthData: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.isAuthChecking = false;
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthChecking: (state, action) => {
      state.isAuthChecking = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isAuthChecking = false;
    },
    clearError: (state) => {
      state.error = null;
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
    dispatch(updateUserProfileAction(response.user));
    dispatch(setLoading(false));
    return response.user;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const uploadAvatarThunk = (file) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.uploadAvatar(file);
    dispatch(updateUserProfileAction(response.user));
    dispatch(setLoading(false));
    return response.user;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const uploadCoverThunk = (file) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await authService.uploadCover(file);
    dispatch(updateUserProfileAction(response.user));
    dispatch(setLoading(false));
    return response.user;
  } catch (error) {
    dispatch(setError(error));
    throw error;
  }
};

export const getCurrentUser = () => async (dispatch) => {
  try {
    const response = await authService.getCurrentUser();
    dispatch(setAuthData(response));
    return response;
  } catch (error) {
    dispatch(clearAuthData());
    return null;
  }
};

export const {
  setAuthData,
  clearAuthData,
  setLoading,
  setAuthChecking,
  setError,
  clearError,
  updateUserProfile: updateUserProfileAction
} = authSlice.actions;

export default authSlice.reducer;