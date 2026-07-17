import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import connectionReducer from './slices/connectionSlice';
import feedReducer from './slices/feedSlice';
import userProfileReducer from './slices/userProfileSlice';
import postReducer from './slices/postSlice';
import jobReducer from './slices/jobSlice';
import notificationReducer from './slices/notificationSlice';
import presenceReducer from './slices/presenceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    connections: connectionReducer,
    feed: feedReducer,
    userProfile: userProfileReducer,
    posts: postReducer,
    jobs: jobReducer,
    notifications: notificationReducer,
    presence: presenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});