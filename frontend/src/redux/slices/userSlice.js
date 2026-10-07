import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUsers();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch users');
    }
  }
);

export const createUserThunk = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create user');
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user');
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createUserThunk
      .addCase(createUserThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.users.push(action.payload);
        }
      })
      // deleteUserThunk
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { setSelectedUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
