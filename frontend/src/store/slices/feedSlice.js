import { createSlice } from '@reduxjs/toolkit';
import userService from '@/services/userService';

const initialState = {
  users: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearFeed: (state) => {
      state.users = [];
      state.pagination = initialState.pagination;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setFeedData: (state, action) => {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination = action.payload.pagination;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

// Action creators
export const fetchFeed = ({ page = 1, limit = 10, skills = null }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await userService.getFeed(page, limit, skills);
    dispatch(setFeedData(response));
  } catch (error) {
    dispatch(setError(error));
  }
};

export const { clearFeed, setLoading, setFeedData, setError } = feedSlice.actions;
export default feedSlice.reducer;