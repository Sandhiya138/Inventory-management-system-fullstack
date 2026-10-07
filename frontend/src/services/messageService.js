import { api } from './api';

export const messageService = {
  async getConversations() {
    return await api.get('/conversations');
  },

  async createConversation(conversationData) {
    return await api.post('/conversations', conversationData);
  },

  async getMessages(conversationId) {
    return await api.get(`/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId, content) {
    return await api.post(`/conversations/${conversationId}/messages`, { content });
  },
};
