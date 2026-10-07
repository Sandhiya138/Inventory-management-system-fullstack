import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService } from '../../services/messageService';

export const fetchConversations = createAsyncThunk(
  'messaging/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await messageService.getConversations();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messaging/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      return await messageService.getMessages(conversationId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  error: null,
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveConversation, appendMessage } = messagingSlice.actions;
export default messagingSlice.reducer;
