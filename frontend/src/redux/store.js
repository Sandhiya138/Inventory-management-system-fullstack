import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import messagingReducer from './slices/messagingSlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    orders: orderReducer,
    messaging: messagingReducer,
    messages: messagingReducer,
    notifications: notificationReducer,
    users: userReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
