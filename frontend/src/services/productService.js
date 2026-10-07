import { api } from './api';

export const productService = {
  // Products
  async getProducts(params = {}) {
    return await api.get('/products', params);
  },

  async getProductById(id) {
    return await api.get(`/products/${id}`);
  },

  async createProduct(productData) {
    return await api.post('/products', productData);
  },

  async updateProduct(id, productData) {
    return await api.put(`/products/${id}`, productData);
  },

  async deleteProduct(id) {
    return await api.delete(`/products/${id}`);
  },

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

  // Suppliers
  async getSuppliers() {
    return await api.get('/suppliers');
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

  // Stock movements
  async getStockMovements(productId = null) {
    return await api.get('/stock-movements', productId ? { productId } : {});
  },

  async recordStockMovement(movementData) {
    return await api.post('/stock-movements', movementData);
  },
};
