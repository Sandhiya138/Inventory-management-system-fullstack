import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { OrderStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { ReturnRequestModal } from '../../components/orders/ReturnRequestModal';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const loadMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      const list = Array.isArray(data) ? data : [];
      const sorted = list.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load order history');
      showError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            My <span className="text-gold">Requisition Orders</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Track fulfillment timelines, request order cancellations, or submit return authorizations.
          </p>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => navigate('/viewer/browse')}
        >
          New Requisition
        </Button>
      </div>

      {/* Orders List */}
      <Card p={0}>
        {error ? (
          <div className="p-6">
            <ErrorState
              title="Failed to Load Orders"
              message={error}
              onRetry={loadMyOrders}
            />
          </div>
        ) : loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" count={5} />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Placed Yet"
            message="You have not submitted any requisition orders. Browse the catalog to place an order."
            icon="shopping-bag"
            action={
              <Button
                variant="primary"
                onClick={() => navigate('/viewer/browse')}
              >
                Browse Catalog
              </Button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Destination</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Total Value</th>
                  <th style={{ textAlign: 'center' }}>Assigned Officer</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Placed Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <span
                        className="font-bold text-gold cursor-pointer hover:underline"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        {ord.orderNumber || `#${ord.id}`}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-main line-clamp-1" style={{ maxWidth: '200px' }}>
                        {ord.shippingAddress || 'Default Warehouse'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-semibold text-main">
                        {ord.orderItems?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0}
                      </span>
                      <span className="text-xs text-muted block">
                        ({ord.orderItems?.length || 0} items)
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-cream)' }}>
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="text-xs px-2 py-1 rounded inline-block" style={{ background: 'rgba(212, 175, 55, 0.12)', color: 'var(--color-gold)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                        {ord.assignedStaff ? ord.assignedStaff.fullName : 'Ops Pool'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <OrderStatusBadge status={ord.status} />
                    </td>
                    <td className="text-xs text-muted">
                      {formatDateTime(ord.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="eye"
                          onClick={() => setSelectedOrder(ord)}
                        >
                          Track
                        </Button>
                        {ord.status === 'DELIVERED' && (
                          <Button
                            variant="wine"
                            size="sm"
                            icon="returns"
                            onClick={() => setReturnOrder(ord)}
                          >
                            Return
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details & Tracking Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onStatusUpdated={loadMyOrders}
          onRequestReturn={(ord) => setReturnOrder(ord)}
        />
      )}

      {/* Return Request Modal */}
      {returnOrder && (
        <ReturnRequestModal
          isOpen={!!returnOrder}
          onClose={() => setReturnOrder(null)}
          order={returnOrder}
          onSuccess={loadMyOrders}
        />
      )}
    </div>
  );
};
