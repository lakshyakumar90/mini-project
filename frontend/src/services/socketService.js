import io from 'socket.io-client';
import { addRealtimeNotification } from '@/store/slices/notificationSlice';
import { setUserStatus, setTypingStatus } from '@/store/slices/presenceSlice';
import { addMessage, updateMessageStatus, markChatMessagesRead } from '@/store/slices/chatSlice';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    if (url && url !== '' && url !== '/') return url;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://localhost:3333';
};

const SOCKET_URL = getSocketUrl();

let socket = null;
let currentUserId = null;
let activeChatId = null;
let isConnecting = false;

const socketService = {
  setActiveChatId: (chatId) => {
    activeChatId = chatId;
  },

  getActiveChatId: () => activeChatId,

  sendChatMessage: (receiver, content, tempId) => {
    if (socket && socket.connected && currentUserId && receiver && content) {
      const now = new Date().toISOString();
      socket.emit('send_message', {
        content: content.trim(),
        sender: currentUserId,
        receiver: receiver,
        timestamp: now,
        _id: tempId
      });
      return true;
    }
    return false;
  },

  connect: (userId, dispatch) => {
    if (!userId) return null;
    if (socket && (socket.connected || isConnecting || !socket.disconnected) && currentUserId === userId) {
      return socket;
    }

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    currentUserId = userId;
    isConnecting = true;
    socket = io(SOCKET_URL, {
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      isConnecting = false;
      console.log('✅ Global socket connected/reconnected:', socket.id);
      socket.emit('register_user', userId);
      if (activeChatId) {
        socket.emit('join_chat', { userId, targetUserId: activeChatId });
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connect_error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      isConnecting = false;
      console.log('🔌 Socket disconnected:', reason);
    });

    // Listeners for Notifications
    socket.on('notification', (notification) => {
      if (dispatch && notification) {
        dispatch(addRealtimeNotification(notification));
      }
    });

    // Listeners for Presence
    socket.on('user_status_change', (data) => {
      if (dispatch && data) {
        dispatch(setUserStatus(data));
      }
    });

    // Listeners for Typing Indicators
    socket.on('typing_start', ({ senderId }) => {
      if (dispatch && senderId) {
        dispatch(setTypingStatus({ senderId, isTyping: true }));
      }
    });

    socket.on('typing_stop', ({ senderId }) => {
      if (dispatch && senderId) {
        dispatch(setTypingStatus({ senderId, isTyping: false }));
      }
    });

    // Listeners for Chat Messages
    socket.on('receive_message', (newMessage) => {
      if (!dispatch || !newMessage || !currentUserId) return;
      try {
        const messageSender = newMessage.senderId || newMessage.sender;
        if (!messageSender || messageSender === currentUserId) return;

        const formattedMessage = {
          _id: newMessage._id || `received-${Date.now()}`,
          sender: messageSender,
          senderId: messageSender,
          content: newMessage.text || newMessage.content || "",
          createdAt: newMessage.timestamp || new Date().toISOString(),
          timestamp: newMessage.timestamp || new Date().toISOString(),
          status: newMessage.status || (activeChatId === messageSender ? 'read' : 'delivered')
        };

        dispatch(addMessage({
          chatId: messageSender,
          message: formattedMessage,
        }));

        if (socket && socket.connected) {
          if (activeChatId === messageSender) {
            socket.emit('mark_messages_read', { senderId: messageSender });
          } else if (newMessage._id) {
            socket.emit('message_delivered', { messageId: newMessage._id, senderId: messageSender });
          }
        }
      } catch (err) {
        console.error('Error processing received message in socketService:', err);
      }
    });

    socket.on('message_sent', (data) => {
      if (!dispatch || !data) return;
      const currentChatId = socketService.getActiveChatId();
      dispatch(updateMessageStatus({
        chatId: currentChatId,
        tempId: data.tempId,
        newId: data._id,
        status: data.status || 'sent'
      }));
    });

    socket.on('message_status_update', (data) => {
      if (!dispatch || !data) return;
      dispatch(updateMessageStatus({
        chatId: data.chatId || activeChatId,
        messageId: data.messageId,
        status: data.status
      }));
    });

    socket.on('messages_read', (data) => {
      if (!dispatch || !data) return;
      dispatch(markChatMessagesRead({
        chatId: data.chatId || data.readerId || activeChatId,
        readerId: data.readerId
      }));
    });

    return socket;
  },

  getSocket: () => socket,

  emit: (event, data, callback) => {
    if (socket && socket.connected) {
      socket.emit(event, data, callback);
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentUserId = null;
      activeChatId = null;
      isConnecting = false;
    }
  }
};

export default socketService;
