import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getOrders();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReturns = createAsyncThunk(
  'orders/fetchReturns',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getReturns();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  orders: [],
  returns: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Returns
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.returns = action.payload || [];
      });
  },
});

export const { setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
