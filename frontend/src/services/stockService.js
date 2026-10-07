import { api } from './api';

export const stockService = {
  async getStockMovements(productId = null) {
    return await api.get('/stock-movements', productId ? { productId } : {});
  },

  async recordStockMovement(movementData) {
    return await api.post('/stock-movements', movementData);
  },
};
