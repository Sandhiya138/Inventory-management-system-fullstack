import { api } from './api';

export const reportService = {
  async getInventoryReport() {
    return await api.get('/reports/inventory');
  },

  async getSalesReport() {
    return await api.get('/reports/sales');
  },

  async getPurchaseReport() {
    return await api.get('/reports/purchases');
  },

  async getStockMovementReport() {
    return await api.get('/reports/stock-movements');
  },
};
