import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '@/services/notificationService';

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      return { id, unreadCount: response.unreadCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotificationThunk = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationService.deleteNotification(id);
      return { id, unreadCount: response.unreadCount };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification: (state, action) => {
      // Avoid duplicates if already exists
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotificationsThunk
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // markNotificationReadThunk
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload.id);
        if (item) {
          item.read = true;
        }
        state.unreadCount = action.payload.unreadCount;
      })
      // markAllNotificationsReadThunk
      .addCase(markAllNotificationsReadThunk.fulfilled, (state, action) => {
        state.items.forEach((item) => {
          item.read = true;
        });
        state.unreadCount = action.payload;
      })
      // deleteNotificationThunk
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload.id);
        state.unreadCount = action.payload.unreadCount;
      });
  }
});

export const { addRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
