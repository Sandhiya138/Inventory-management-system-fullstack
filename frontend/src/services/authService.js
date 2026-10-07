import { api } from './api';

export const authService = {
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      }));
    }
    return data;
  },

  async register(signupData) {
    const data = await api.post('/auth/register', signupData);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      }));
    }
    return data;
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('token');
  },
};
