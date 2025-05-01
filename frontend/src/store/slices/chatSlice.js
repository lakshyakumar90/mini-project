import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: {},
  activeChat: null,
  loading: false,
  error: null,
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
      
      if (state.activeChat !== chatId) {
        state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
      }
    },
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    clearChat: (state, action) => {
      const chatId = action.payload;
      delete state.messages[chatId];
      delete state.unreadCounts[chatId];
      if (state.activeChat === chatId) {
        state.activeChat = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setActiveChat,
  addMessage,
  setMessages,
  clearChat,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;