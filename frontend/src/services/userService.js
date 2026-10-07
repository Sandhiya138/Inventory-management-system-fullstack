import { api } from './api';

export const userService = {
  async getUsers() {
    return await api.get('/users');
  },

  async getUserById(id) {
    return await api.get(`/users/${id}`);
  },

  async createUser(userData) {
    return await api.post('/users', userData);
  },

  async updateUser(id, userData) {
    return await api.put(`/users/${id}`, userData);
  },

  async deleteUser(id) {
    return await api.delete(`/users/${id}`);
  },
};
