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
    limit: 50,
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

      // Check for duplicate messages by ID or content+sender+time
      const messageExists = state.messages[chatId].some(msg => {
        if (!msg) return false;

        // Check by ID first (most reliable)
        if (msg._id && message._id && msg._id === message._id) {
          return true;
        }

        // Check by content, sender, and time (within 2 seconds)
        if (msg.content === message.content &&
            (msg.sender === message.sender || msg.senderId === message.senderId)) {
          const msgTime = new Date(msg.createdAt || msg.timestamp).getTime();
          const newMsgTime = new Date(message.createdAt || message.timestamp).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);
          if (timeDiff < 2000) {
            // Upgrade temp message inline if real message arrives
            if ((msg._id && msg._id.toString().startsWith('temp-')) && (message._id && !message._id.toString().startsWith('temp-'))) {
              msg._id = message._id;
              if (message.status) msg.status = message.status;
            }
            return true;
          }
        }

        return false;
      });

      if (!messageExists) {
        state.messages[chatId].push(message);

        // Sort messages by timestamp to maintain chronological order
        state.messages[chatId].sort((a, b) => {
          const timeA = new Date(a.createdAt || a.timestamp).getTime();
          const timeB = new Date(b.createdAt || b.timestamp).getTime();
          return timeA - timeB;
        });
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
      const { chatId, messages, pagination } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      const existingIds = new Set(state.messages[chatId].map(m => m._id));
      const newMessages = (messages || []).filter(m => !existingIds.has(m._id));
      state.messages[chatId] = [...newMessages, ...state.messages[chatId]];
      if (pagination) {
        state.pagination = pagination;
      }
    },
    setChatPartners: (state, action) => {
      if (Array.isArray(action.payload)) {
        if (
          state.chatPartners &&
          state.chatPartners.length === action.payload.length &&
          state.chatPartners.every((item, idx) => item?._id === action.payload[idx]?._id)
        ) {
          return;
        }
        state.chatPartners = action.payload;
      }
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
    updateMessageStatus: (state, action) => {
      const { chatId, messageId, tempId, status, newId } = action.payload;
      const msgs = state.messages[chatId];
      if (!msgs || !Array.isArray(msgs)) return;

      msgs.forEach(msg => {
        if (!msg) return;
        if ((messageId && msg._id === messageId) || (tempId && (msg._id === tempId || msg.tempId === tempId))) {
          if (status) msg.status = status;
          if (newId) {
            msg._id = newId;
            delete msg.tempId;
          }
        }
      });
    },
    markChatMessagesRead: (state, action) => {
      const { chatId, readerId, senderId } = action.payload;
      const targetChatId = chatId || readerId || senderId;
      const msgs = state.messages[targetChatId];
      if (!msgs || !Array.isArray(msgs)) return;

      msgs.forEach(msg => {
        if (!msg) return;
        if (msg.status !== 'read' && (!senderId || msg.senderId === senderId || msg.sender === senderId)) {
          msg.status = 'read';
        }
      });
    },
    clearMessages: (state) => {
      state.messages = {};
      state.activeChat = null;
      state.pagination = initialState.pagination;
    }
  },
});

// Action creators
export const fetchMessages = ({ userId, page = 1, limit = 50 }) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await messageService.getMessages(userId, page, limit);
    if (response.success && response.messages) {
      const processedMessages = response.messages.map(msg => ({
        _id: msg._id,
        sender: msg.senderId || msg.sender,
        senderId: msg.senderId || msg.sender,
        content: msg.text || msg.content,
        createdAt: msg.timestamp,
        timestamp: msg.timestamp,
        status: msg.status || 'sent'
      }));
      dispatch(setMessages({
        chatId: userId,
        messages: processedMessages,
        pagination: response.pagination
      }));
    }
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error));
    dispatch(setLoading(false));
  }
};

export const loadMoreMessages = ({ userId, page = 1, limit = 20 }) => async (dispatch) => {
  try {
    const response = await messageService.getMessages(userId, page, limit);
    if (response.success && response.messages) {
      const processedMessages = response.messages.map(msg => ({
        _id: msg._id,
        sender: msg.senderId || msg.sender,
        senderId: msg.senderId || msg.sender,
        content: msg.text || msg.content,
        createdAt: msg.timestamp,
        timestamp: msg.timestamp,
        status: msg.status || 'sent'
      }));
      dispatch(appendMessages({ 
        chatId: userId, 
        messages: processedMessages,
        pagination: response.pagination
      }));
    }
  } catch (error) {
    dispatch(setError(error));
  }
};

export const sendMessage = ({ userId, content }) => async (dispatch) => {
  try {
    const response = await messageService.sendMessage(userId, content);
    if (response.success && response.message) {
      const msg = response.message;
      dispatch(addMessage({
        chatId: userId,
        message: {
          _id: msg._id,
          sender: msg.senderId || msg.sender,
          senderId: msg.senderId || msg.sender,
          content: msg.text || msg.content,
          createdAt: msg.timestamp,
          timestamp: msg.timestamp,
          status: msg.status || 'sent'
        }
      }));
    }
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
  updateMessageStatus,
  markChatMessagesRead,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;