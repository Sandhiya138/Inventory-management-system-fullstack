import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { OrderTimeline } from './OrderTimeline';
import { OrderStatusBadge } from '../common/Badge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';

export const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onStatusUpdated,
  onRequestReturn,
}) => {
  const { isAdmin, isStaff, isViewer } = useAuth();
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  if (!order) return null;

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setLoading(true);
    try {
      await orderService.updateOrderStatus(order.id, newStatus, statusNotes);
      showSuccess(`Order status updated to ${newStatus}`);
      setNewStatus('');
      setStatusNotes('');
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setLoading(true);
    try {
      await orderService.updateOrderStatus(order.id, 'CANCELLED', 'Cancelled by viewer');
      showSuccess('Order cancelled successfully');
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'CONFIRMED', label: 'CONFIRMED' },
    { value: 'PROCESSING', label: 'PROCESSING' },
    { value: 'PACKED', label: 'PACKED' },
    { value: 'SHIPPED', label: 'SHIPPED' },
    { value: 'DELIVERED', label: 'DELIVERED' },
    { value: 'CANCELLED', label: 'CANCELLED' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
      subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
      maxWidth="680px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {isViewer && order.status === 'PENDING' && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelOrder}
                loading={loading}
              >
                Cancel Order
              </Button>
            )}
            {isViewer && order.status === 'DELIVERED' && (
              <Button
                variant="wine"
                size="sm"
                icon="returns"
                onClick={() => {
                  onClose();
                  onRequestReturn(order);
                }}
              >
                Request Return
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 rounded-md" style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div>
            <span className="text-muted text-xs block mb-1">Current Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="text-right">
            <span className="text-muted text-xs block mb-1">Total Amount</span>
            <span className="text-gold font-bold text-xl font-heading">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Visual Timeline */}
        <OrderTimeline status={order.status} />

        {/* Items List */}
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-3">Order Items</h4>
          <div className="card p-0" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold text-main">{item.product?.productName}</div>
                      <div className="text-muted text-xs">SKU: {item.product?.sku}</div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer, Assigned Staff & Shipping Info */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">
              {order.orderType === 'PURCHASE_ORDER' ? 'Supplier' : 'Customer'}
            </span>
            <span className="text-main font-semibold text-sm">
              {order.orderType === 'PURCHASE_ORDER'
                ? order.supplier?.name || 'Direct PO'
                : order.viewer?.fullName || 'Customer'}
            </span>
            {order.viewer?.email && (
              <span className="text-muted text-xs block mt-1">{order.viewer.email}</span>
            )}
          </div>

          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Assigned Fulfillment Officer</span>
            <span className="text-gold font-semibold text-sm flex items-center gap-1 mt-1">
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: order.assignedStaff ? '#7a9a83' : '#d4af37', display: 'inline-block' }}></span>
              {order.assignedStaff ? order.assignedStaff.fullName : 'Warehouse Team'}
            </span>
            {order.assignedStaff?.email && (
              <span className="text-muted text-xs block mt-1">{order.assignedStaff.email}</span>
            )}
          </div>

          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Shipping Destination</span>
            <span className="text-main font-semibold text-sm">
              {order.shippingAddress || 'Not specified'}
            </span>
            {order.notes && (
              <span className="text-muted text-xs block mt-1">Note: {order.notes}</span>
            )}
          </div>
        </div>

        {/* Staff/Admin Status Change Control */}
        {(isAdmin || isStaff) && order.status !== 'CANCELLED' && (
          <div className="card p-4" style={{ background: 'rgba(56, 26, 77, 0.25)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h4 className="text-sm font-semibold text-gold mb-3">Update Order Status</h4>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
              <Select
                name="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={statusOptions}
                placeholder="Select next status"
              />
              <input
                type="text"
                placeholder="Optional notes..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="input"
              />
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={!newStatus}
                loading={loading}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
