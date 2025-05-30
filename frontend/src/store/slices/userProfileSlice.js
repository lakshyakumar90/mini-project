import { createSlice } from '@reduxjs/toolkit';
import userService from '@/services/userService';

const initialState = {
  userProfile: null,
  loading: false,
  error: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.userProfile = null;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setUserProfile: (state, action) => {
      state.loading = false;
      state.userProfile = action.payload;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

// Action creators
export const fetchUserProfile = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await userService.getUserById(userId);
    dispatch(setUserProfile(response.user));
  } catch (error) {
    dispatch(setError(error));
  }
};

export const { clearUserProfile, setLoading, setUserProfile, setError } = userProfileSlice.actions;
export default userProfileSlice.reducer;