import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import connectionReducer from './slices/connectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    connections: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});