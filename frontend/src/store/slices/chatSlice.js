import { createSlice } from '@reduxjs/toolkit';
import messageService from '@/services/messageService';

const initialState = {
  messages: {},
  activeChat: null,
  loading: false,
  error: null,
  chatPartners: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!chatId || !message) return;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      const messageExists = state.messages[chatId].some(msg => {
        if (!msg) return false;
        if (msg._id && message._id && msg._id === message._id) {
          return true;
        }
        if (msg.content === message.content && msg.sender === message.sender) {
          const msgTime = new Date(msg.createdAt || msg.timestamp).getTime();
          const newMsgTime = new Date(message.createdAt || message.timestamp).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);
          if (timeDiff < 1000) {
            return true;
          }
        }
        return false;
      });

      if (!messageExists) {
        state.messages[chatId].push(message);
        if (Array.isArray(state.messages[chatId]) && state.messages[chatId].length > 1) {
          state.messages[chatId].sort((a, b) => {
            if (!a || !b) return 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() :
                         (a.timestamp ? new Date(a.timestamp).getTime() : 0);
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() :
                         (b.timestamp ? new Date(b.timestamp).getTime() : 0);
            if (timeA === timeB) {
              const idTimeA = parseInt(a._id.split('-')[1], 10);
              const idTimeB = parseInt(b._id.split('-')[1], 10);
              return idTimeA - idTimeB;
            }
            return timeA - timeB;
          });
        }
      }
    },
    setMessages: (state, action) => {
      const { chatId, messages, pagination } = action.payload;
      state.messages[chatId] = messages;
      if (pagination) {
        state.pagination = pagination;
      }
    },
    appendMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId] = [...messages, ...state.messages[chatId]];
    },
    setChatPartners: (state, action) => {
      state.chatPartners = action.payload;
    },
    clearChat: (state, action) => {
      const chatId = action.payload;
      delete state.messages[chatId];
      if (state.activeChat === chatId) {
        state.activeChat = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = {};
      state.activeChat = null;
      state.pagination = initialState.pagination;
    }
  },
});

// Action creators
export const fetchMessages = ({ userId, page = 1, limit = 20 }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await messageService.getMessages(userId, page, limit);
    if (response.success && response.messages) {
      const processedMessages = response.messages.map(msg => ({
        _id: msg._id,
        sender: msg.senderId,
        content: msg.text,
        createdAt: msg.timestamp
      }));
      dispatch(setMessages({ 
        chatId: userId, 
        messages: processedMessages,
        pagination: response.pagination
      }));
    }
  } catch (error) {
    dispatch(setError(error));
  }
};

export const loadMoreMessages = ({ userId, page = 1, limit = 20 }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await messageService.getMessages(userId, page, limit);
    if (response.success && response.messages) {
      const processedMessages = response.messages.map(msg => ({
        _id: msg._id,
        sender: msg.senderId,
        content: msg.text,
        createdAt: msg.timestamp
      }));
      dispatch(appendMessages({ chatId: userId, messages: processedMessages }));
    }
  } catch (error) {
    dispatch(setError(error));
  }
};

export const sendMessage = ({ userId, content }) => async (dispatch) => {
  try {
    const response = await messageService.sendMessage(userId, content);
    dispatch(addMessage({ chatId: userId, message: response.message }));
  } catch (error) {
    dispatch(setError(error));
  }
};

export const {
  setActiveChat,
  addMessage,
  setMessages,
  appendMessages,
  setChatPartners,
  clearChat,
  setLoading,
  setError,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;