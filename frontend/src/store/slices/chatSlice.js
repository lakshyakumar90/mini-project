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
      if (!chatId || !message) return;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      // Check if message with same ID already exists to avoid duplicates
      // Also check for messages with the same content and timestamp (within 1 second)
      const messageExists = state.messages[chatId].some(msg => {
        if (!msg) return false;

        // Check by ID if available
        if (msg._id && message._id && msg._id === message._id) {
          return true;
        }

        // Check by content and timestamp (for messages without stable IDs)
        if (msg.content === message.content && msg.sender === message.sender) {
          const msgTime = new Date(msg.createdAt || msg.timestamp).getTime();
          const newMsgTime = new Date(message.createdAt || message.timestamp).getTime();
          const timeDiff = Math.abs(msgTime - newMsgTime);

          // If messages are within 1 second of each other, consider them duplicates
          if (timeDiff < 1000) {
            return true;
          }
        }

        return false;
      });

      if (!messageExists) {
        // Add the message to the array
        state.messages[chatId].push(message);

        // Sort messages by timestamp to ensure chronological order (oldest first)
        if (Array.isArray(state.messages[chatId]) && state.messages[chatId].length > 1) {
          state.messages[chatId].sort((a, b) => {
            if (!a || !b) return 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB; // Ascending order (oldest first)
          });
        }

        // Increment unread count if this chat is not active
        if (state.activeChat !== chatId) {
          state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
        }
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
    markMessagesAsRead: (state, action) => {
      const { chatId, messageIds } = action.payload;

      if (!chatId) return; // Guard against null chatId

      // If no specific message IDs are provided, mark all messages in the chat as read
      if (!messageIds || messageIds.length === 0) {
        if (state.messages[chatId] && Array.isArray(state.messages[chatId])) {
          state.messages[chatId].forEach(message => {
            if (!message) return; // Skip null messages
            // Only mark messages from the other user as read
            if (message.sender && message.sender !== state.activeChat) {
              message.read = true;
              message.readAt = new Date().toISOString();
            }
          });
        }
      } else {
        // Mark only specific messages as read
        if (state.messages[chatId] && Array.isArray(state.messages[chatId])) {
          state.messages[chatId].forEach(message => {
            if (!message || !message._id) return; // Skip null messages or messages without _id
            if (messageIds.includes(message._id)) {
              message.read = true;
              message.readAt = new Date().toISOString();
            }
          });
        }
      }

      // Reset unread count for this chat
      if (state.unreadCounts) {
        state.unreadCounts[chatId] = 0;
      }
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
          // Sort messages by timestamp to ensure chronological order (oldest first)
          const sortedMessages = [...messages].sort((a, b) => {
            if (!a || !b) return 0;
            const timeA = a.createdAt || a.timestamp ? new Date(a.createdAt || a.timestamp).getTime() : 0;
            const timeB = b.createdAt || b.timestamp ? new Date(b.createdAt || b.timestamp).getTime() : 0;
            return timeA - timeB; // Ascending order (oldest first)
          });

          // Store the messages with the correct format
          state.messages[userId] = sortedMessages;
        } else {
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
      .addCase(sendMessage.fulfilled, (_) => {
        // We already added a temporary message when sending, so we don't need to add it again
        // This prevents duplicate messages
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
  markMessagesAsRead: markMessagesAsReadAction,
} = chatSlice.actions;

export default chatSlice.reducer;