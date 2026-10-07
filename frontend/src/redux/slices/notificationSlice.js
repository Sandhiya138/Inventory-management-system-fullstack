import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'notifications/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getAnnouncements();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  notifications: [],
  announcements: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload || [];
        state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
      })
      // fetchAnnouncements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload || [];
      })
      // markRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.notifications.find((n) => n.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationSlice.reducer;
