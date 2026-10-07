import { api } from './api';

export const notificationService = {
  // Notifications
  async getNotifications() {
    return await api.get('/notifications');
  },

  async markAsRead(id) {
    return await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return await api.put('/notifications/read-all');
  },

  // Announcements
  async getAnnouncements() {
    return await api.get('/announcements');
  },

  async createAnnouncement(announcementData) {
    return await api.post('/announcements', announcementData);
  },

  async markAnnouncementAsRead(id) {
    return await api.put(`/announcements/${id}/read`);
  },

  async deleteAnnouncement(id) {
    return await api.delete(`/announcements/${id}`);
  },
};
