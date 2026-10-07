import { api } from './api';

export const orderService = {
  // Orders
  async getOrders() {
    return await api.get('/orders');
  },

  async getMyOrders() {
    return await api.get('/orders/my-orders');
  },

  async getOrderById(id) {
    return await api.get(`/orders/${id}`);
  },

  async createOrder(orderData) {
    return await api.post('/orders', orderData);
  },

  async updateOrderStatus(id, status, notes = '') {
    return await api.put(`/orders/${id}/status`, { status, notes });
  },

  // Returns
  async getReturns() {
    return await api.get('/returns');
  },

  async getReturnById(id) {
    return await api.get(`/returns/${id}`);
  },

  async createReturn(returnData) {
    return await api.post('/returns', returnData);
  },

  async processReturn(id, status, staffNotes = '') {
    return await api.put(`/returns/${id}`, { status, staffNotes });
  },
};
