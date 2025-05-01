import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messageService from '@/services/messageService';

// Async thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(userId, page, limit);
      console.log('API response for messages:', response);

      // Ensure we have a consistent format for messages
      if (response.success && response.messages) {
        // Process messages to ensure consistent format
        const processedMessages = response.messages.map(msg => ({
          _id: msg._id,
          // Use senderId for the new schema
          sender: msg.senderId,
          // Use text instead of content
          content: msg.text,
          // Use timestamp instead of createdAt
          createdAt: msg.timestamp
        }));

        return {
          userId,
          messages: processedMessages,
          pagination: response.pagination
        };
      }

      return { userId, ...response };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return rejectWithValue(error);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ userId, content }, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(userId, content);
      // Return the message data
      return { userId, message: response.message };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getUnreadCount();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  messages: {},
  activeChat: null,
  loading: false,
  error: null,
  unreadCounts: {},
  chatPartners: [], // List of users the current user can chat with (connections)
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

      // Check if message with same ID already exists to avoid duplicates
      // Also check for messages with the same content and timestamp (within 1 second)
      const messageExists = state.messages[chatId].some(msg => {
        // Check by ID if available
        if (msg._id && message._id && msg._id === message._id) {
          console.log('Duplicate message detected by ID:', message._id);
          return true;
        }

        // Check by content and timestamp (for messages without stable IDs)
        if (msg.content === message.content && msg.sender === message.sender) {
          const msgTime = new Date(msg.createdAt || msg.timestamp).getTime();
          const newMsgTime = new Date(message.createdAt || message.timestamp).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);

          // If messages are within 1 second of each other, consider them duplicates
          if (timeDiff < 1000) {
            console.log('Duplicate message detected by content and timestamp:', message);
            return true;
          }
        }

        return false;
      });

      if (!messageExists) {
        state.messages[chatId].push(message);

        // Increment unread count if this chat is not active
        if (state.activeChat !== chatId) {
          state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
        }

        console.log(`Message added to chat ${chatId}:`, message);
      }
    },
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    setChatPartners: (state, action) => {
      state.chatPartners = action.payload;
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
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages } = action.payload;

        // Make sure messages have the correct format
        if (messages && Array.isArray(messages)) {
          console.log('Received messages from API:', messages);

          // Store the messages with the correct format
          state.messages[userId] = messages;
        } else {
          console.error('Invalid messages format received:', messages);
          state.messages[userId] = [];
        }

        // Reset unread count when messages are fetched
        state.unreadCounts[userId] = 0;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send message
      .addCase(sendMessage.pending, () => {
        // No need to set loading state for sending messages
      })
      .addCase(sendMessage.fulfilled, (_, action) => {
        // We already added a temporary message when sending, so we don't need to add it again
        // This prevents duplicate messages
        console.log('Message sent successfully via API:', action.payload);
        // We could update the temporary message with the real ID if needed
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCounts = action.payload.unreadCount || {};
      });
  },
});

export const {
  setActiveChat,
  addMessage,
  setMessages,
  setChatPartners,
  clearChat,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;