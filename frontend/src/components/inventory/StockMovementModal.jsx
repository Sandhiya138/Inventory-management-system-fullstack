import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { productService } from '../../services/productService';
import { useToast } from '../../hooks/useToast';

export const StockMovementModal = ({
  isOpen,
  onClose,
  product = null,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    movementType: 'STOCK_IN',
    quantity: 1,
    referenceNumber: '',
    reason: '',
  });

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (!product) {
        productService.getProducts().then((res) => setProductsList(res || []));
      }
      setFormData({
        productId: product ? product.id : '',
        movementType: 'STOCK_IN',
        quantity: 1,
        referenceNumber: `SM-${Date.now().toString().slice(-6)}`,
        reason: '',
      });
      setError('');
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await productService.recordStockMovement({
        productId: Number(formData.productId),
        movementType: formData.movementType,
        quantity: parseInt(formData.quantity, 10),
        referenceNumber: formData.referenceNumber,
        reason: formData.reason,
      });

      showSuccess('Stock movement recorded successfully');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to record movement');
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const movementOptions = [
    { value: 'STOCK_IN', label: 'STOCK IN (Intake / Restock)' },
    { value: 'STOCK_OUT', label: 'STOCK OUT (Depletion / Dispatch)' },
    { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Audit Correction)' },
    { value: 'RETURN', label: 'RETURN (Restocked Return)' },
    { value: 'PURCHASE', label: 'PURCHASE (Supplier PO Delivery)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Movement"
      subtitle={product ? `Product: ${product.productName} (Current: ${product.quantity})` : 'Update physical stock levels'}
      maxWidth="500px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save Movement
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {!product && (
          <Select
            label="Product"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            options={productsList.map((p) => ({
              value: p.id,
              label: `${p.productName} (SKU: ${p.sku}) - Qty: ${p.quantity}`,
            }))}
            placeholder="Select a product"
            required
          />
        )}

        <Select
          label="Movement Type"
          name="movementType"
          value={formData.movementType}
          onChange={handleChange}
          options={movementOptions}
          required
        />

        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <Input
          label="Reference Number"
          name="referenceNumber"
          value={formData.referenceNumber}
          onChange={handleChange}
          placeholder="e.g. PO-84920 or AUDIT-2026"
        />

        <div className="form-group">
          <label className="form-label" htmlFor="reason">
            Reason / Notes
          </label>
          <textarea
            id="reason"
            name="reason"
            rows="3"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Reason for stock modification..."
            className="textarea"
          />
        </div>

        {error && <div className="form-error mb-3">{error}</div>}
      </form>
    </Modal>
  );
};
