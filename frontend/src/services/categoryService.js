import { api } from './api';

export const categoryService = {
  // Categories
  async getCategories() {
    return await api.get('/categories');
  },

  async createCategory(categoryData) {
    return await api.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return await api.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return await api.delete(`/categories/${id}`);
  },

  // Subcategories
  async getSubcategories(categoryId = null) {
    return await api.get('/subcategories', categoryId ? { categoryId } : {});
  },

  async createSubcategory(subcategoryData) {
    return await api.post('/subcategories', subcategoryData);
  },

  async updateSubcategory(id, subcategoryData) {
    return await api.put(`/subcategories/${id}`, subcategoryData);
  },

  async deleteSubcategory(id) {
    return await api.delete(`/subcategories/${id}`);
  },
};
