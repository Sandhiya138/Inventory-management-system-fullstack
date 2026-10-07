import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { productService } from '../../services/productService';
import { useToast } from '../../hooks/useToast';

export const ProductFormModal = ({
  isOpen,
  onClose,
  product = null, // null for create, object for edit
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    quantity: 0,
    minimumStock: 5,
    maximumStock: 100,
    purchasePrice: '',
    sellingPrice: '',
    supplierId: '',
    expiryDate: '',
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (product) {
        setFormData({
          productName: product.productName || '',
          sku: product.sku || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          subcategoryId: product.subcategoryId || '',
          quantity: product.quantity ?? 0,
          minimumStock: product.minimumStock ?? 5,
          maximumStock: product.maximumStock ?? 100,
          purchasePrice: product.purchasePrice || '',
          sellingPrice: product.sellingPrice || '',
          supplierId: product.supplierId || '',
          expiryDate: product.expiryDate || '',
        });
        if (product.categoryId) {
          loadSubcategories(product.categoryId);
        }
      } else {
        setFormData({
          productName: '',
          sku: '',
          description: '',
          categoryId: '',
          subcategoryId: '',
          quantity: 0,
          minimumStock: 5,
          maximumStock: 100,
          purchasePrice: '',
          sellingPrice: '',
          supplierId: '',
          expiryDate: '',
        });
        setSubcategories([]);
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const loadDropdowns = async () => {
    try {
      const [cats, supps] = await Promise.all([
        productService.getCategories(),
        productService.getSuppliers(),
      ]);
      setCategories(cats || []);
      setSuppliers(supps || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubcategories = async (catId) => {
    try {
      const subs = await productService.getSubcategories(catId);
      setSubcategories(subs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData((prev) => ({ ...prev, categoryId: catId, subcategoryId: '' }));
    if (catId) {
      loadSubcategories(catId);
    } else {
      setSubcategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.quantity === '' || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (formData.minimumStock === '' || formData.minimumStock < 0) newErrors.minimumStock = 'Minimum stock is required';
    if (formData.maximumStock === '' || formData.maximumStock < 1) newErrors.maximumStock = 'Maximum stock must be at least 1';
    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0) newErrors.purchasePrice = 'Valid purchase price is required';
    if (!formData.sellingPrice || Number(formData.sellingPrice) < 0) newErrors.sellingPrice = 'Valid selling price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        minimumStock: parseInt(formData.minimumStock, 10),
        maximumStock: parseInt(formData.maximumStock, 10),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        categoryId: Number(formData.categoryId),
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        expiryDate: formData.expiryDate || null,
      };

      if (product?.id) {
        await productService.updateProduct(product.id, payload);
        showSuccess('Product updated successfully');
      } else {
        await productService.createProduct(payload);
        showSuccess('Product created successfully');
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      showError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      subtitle={product ? `Update details for SKU: ${product.sku}` : 'Create a new catalog item'}
      maxWidth="680px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {product ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <Input
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="e.g. UltraSharp 27-inch 4K Monitor"
            error={errors.productName}
            required
          />
          <Input
            label="SKU Code"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g. ELEC-MON-001"
            error={errors.sku}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed product specifications..."
            className="textarea"
          />
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleCategoryChange}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.categoryId}
            required
          />

          <Select
            label="Subcategory"
            name="subcategoryId"
            value={formData.subcategoryId}
            onChange={handleChange}
            options={subcategories.map((s) => ({ value: s.id, label: s.name }))}
            placeholder={formData.categoryId ? 'Select subcategory' : 'Select category first'}
            disabled={!formData.categoryId}
          />

          <Select
            label="Supplier"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select supplier (optional)"
          />
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <Input
            label="Initial Stock"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            required
          />
          <Input
            label="Min Stock"
            name="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={handleChange}
            error={errors.minimumStock}
            required
          />
          <Input
            label="Max Stock"
            name="maximumStock"
            type="number"
            min="1"
            value={formData.maximumStock}
            onChange={handleChange}
            error={errors.maximumStock}
            required
          />
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Input
            label="Purchase Price (₹)"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.purchasePrice}
            required
          />
          <Input
            label="Selling Price (₹)"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.sellingPrice}
            required
          />
          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
};
