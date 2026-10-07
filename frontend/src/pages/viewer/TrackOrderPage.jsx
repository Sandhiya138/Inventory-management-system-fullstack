import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { OrderStatusBadge } from '../../components/common/Badge';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { ReturnRequestModal } from '../../components/orders/ReturnRequestModal';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [orderQuery, setOrderQuery] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderQuery(id);
      fetchOrder(id);
    }
  }, [searchParams]);

  const fetchOrder = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Clean query if prefixed with '#'
      const cleanId = query.trim().replace(/^#/, '').replace(/^ORD-/, '');
      const data = await orderService.getOrderById(cleanId);
      setOrder(data);
    } catch (err) {
      showError(err.message || 'Order reference not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this requisition order?')) return;

    try {
      await orderService.updateOrderStatus(order.id, 'CANCELLED', 'Cancelled by viewer');
      showSuccess('Order cancelled successfully');
      fetchOrder(String(order.id));
    } catch (err) {
      showError(err.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading text-main">
          Live Shipment & <span className="text-gold">Requisition Tracking</span>
        </h1>
        <p className="text-muted text-sm mt-1">
          Inspect order progression from warehouse packing through dispatch and final delivery.
        </p>
      </div>

      {/* Lookup Card */}
      <Card>
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            placeholder="Enter Order ID or tracking number (e.g. 1, 2, ORD-12)..."
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            icon="search"
            style={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="primary"
            icon="truck"
            loading={loading}
            disabled={!orderQuery.trim()}
          >
            Track Order
          </Button>
        </form>
      </Card>

      {/* Order Status Display */}
      {order && (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-subtle mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold font-heading text-main">
                    Order {order.orderNumber || `#${order.id}`}
                  </h2>
                  <OrderStatusBadge status={order.status} />
                </div>
                <span className="text-xs text-muted block mt-1">
                  Placed on {formatDateTime(order.createdAt)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted block">Requisition Valuation</span>
                <span className="text-gold font-bold text-xl font-heading">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="my-4">
              <OrderTimeline status={order.status} />
            </div>

            {/* Destination & Logistics */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-subtle text-xs">
              <div className="p-3 bg-surface-1 rounded-md border border-subtle">
                <span className="text-muted block mb-1">Destination Address</span>
                <span className="text-main font-semibold text-sm">
                  {order.shippingAddress || 'Not specified'}
                </span>
              </div>
              <div className="p-3 bg-surface-1 rounded-md border border-subtle">
                <span className="text-muted block mb-1">Requester Account</span>
                <span className="text-main font-semibold text-sm">
                  {order.viewer?.fullName || 'Viewer'} ({order.viewer?.email})
                </span>
              </div>
              <div className="p-3 bg-surface-1 rounded-md border border-subtle">
                <span className="text-muted block mb-1">Assigned Fulfillment Officer</span>
                <span className="text-gold font-semibold text-sm flex items-center gap-2">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: order.assignedStaff ? '#7a9a83' : '#d4af37', display: 'inline-block' }}></span>
                  {order.assignedStaff ? `${order.assignedStaff.fullName}` : 'Warehouse Ops Pool'}
                </span>
              </div>
            </div>

            {/* Actions for Viewer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-subtle">
              {order.status === 'PENDING' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon="trash"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
              {order.status === 'DELIVERED' && (
                <Button
                  variant="wine"
                  size="sm"
                  icon="returns"
                  onClick={() => setReturnOrder(order)}
                >
                  Request Return (RMA)
                </Button>
              )}
            </div>
          </Card>

          {/* Items breakdown card */}
          <Card title="Dispatched Line Items" subtitle="Verified SKU shipment contents" icon="package" p={0}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="font-semibold text-main block">
                          {item.product?.productName}
                        </span>
                        <span className="text-xs text-gold font-mono">
                          SKU: {item.product?.sku}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }} className="text-main">
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrder && (
        <ReturnRequestModal
          isOpen={!!returnOrder}
          onClose={() => setReturnOrder(null)}
          order={returnOrder}
          onSuccess={() => fetchOrder(String(order.id))}
        />
      )}
    </div>
  );
};
