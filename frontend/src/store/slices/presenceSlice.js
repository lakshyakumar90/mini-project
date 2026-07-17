import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  onlineUsers: {}, // userId -> 'online' | 'offline'
  lastSeenMap: {}, // userId -> timestamp string
  typingMap: {}    // userId -> boolean
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setUserStatus: (state, action) => {
      const { userId, status, lastSeen } = action.payload;
      if (userId) {
        state.onlineUsers[userId] = status;
        if (lastSeen) {
          state.lastSeenMap[userId] = lastSeen;
        }
      }
    },
    setUsersStatusMap: (state, action) => {
      if (action.payload && typeof action.payload === 'object') {
        state.onlineUsers = { ...state.onlineUsers, ...action.payload };
      }
    },
    setTypingStatus: (state, action) => {
      const { senderId, isTyping } = action.payload;
      if (senderId) {
        state.typingMap[senderId] = isTyping;
      }
    }
  }
});

export const { setUserStatus, setUsersStatusMap, setTypingStatus } = presenceSlice.actions;
export default presenceSlice.reducer;
