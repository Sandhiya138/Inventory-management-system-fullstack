import { api } from './api';

export const supplierService = {
  async getSuppliers() {
    return await api.get('/suppliers');
  },

  async getSupplierById(id) {
    return await api.get(`/suppliers/${id}`);
  },

  async createSupplier(supplierData) {
    return await api.post('/suppliers', supplierData);
  },

  async updateSupplier(id, supplierData) {
    return await api.put(`/suppliers/${id}`, supplierData);
  },

  async deleteSupplier(id) {
    return await api.delete(`/suppliers/${id}`);
  },
};
