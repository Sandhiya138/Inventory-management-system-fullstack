import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { OrderStatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { ReturnRequestModal } from '../../components/orders/ReturnRequestModal';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const OrdersPage = () => {
  const { isViewer } = useAuth();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.message || 'Unable to load orders from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchTerm ||
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(o.id).includes(searchTerm) ||
        o.viewer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || o.status === statusFilter;
      const matchesType = !typeFilter || o.orderType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returned' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Orders & <span className="text-gold">Fulfillment Ledger</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Track and process purchase requisitions, dispatch logistics, and delivery statuses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <Input
            placeholder="Search by order #, recipient, or address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            icon="search"
          />

          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={statusOptions}
          />

          <Select
            placeholder="All Order Types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Order Types' },
              { value: 'SALE_ORDER', label: 'Sales / Viewer Orders' },
              { value: 'PURCHASE_ORDER', label: 'Purchase Orders' },
            ]}
          />
        </div>
      </Card>

      {/* Orders Table */}
      {error ? (
        <ErrorState
          title="Unable to load orders"
          message={error}
          onRetry={loadOrders}
        />
      ) : (
        <Card p={0}>
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table" count={5} />
            </div>
          ) : paginatedOrders.length === 0 ? (
          <EmptyState
            title="No Orders Found"
            message="No orders match your active search or filter criteria."
            icon="shopping-bag"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Type</th>
                  <th>Customer / Recipient</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Placed At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((ord) => (
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
                      <span className="badge badge-default" style={{ fontSize: '0.65rem' }}>
                        {ord.orderType === 'PURCHASE_ORDER' ? 'PO' : 'SALES'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col" style={{ gap: '2px' }}>
                        <span className="font-semibold text-main" style={{ display: 'block', lineHeight: 1.3 }}>
                          {ord.orderType === 'PURCHASE_ORDER'
                            ? ord.supplier?.name || 'Vendor Intake'
                            : ord.viewer?.fullName || 'Viewer'}
                        </span>
                        {ord.viewer?.email && (
                          <span className="text-xs text-muted" style={{ display: 'block', lineHeight: 1.2 }}>
                            {ord.viewer.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex flex-col items-center" style={{ gap: '2px' }}>
                        <span className="font-semibold text-main" style={{ display: 'block' }}>
                          {ord.orderItems?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0}
                        </span>
                        <span className="text-xs text-muted" style={{ display: 'block' }}>
                          ({ord.orderItems?.length || 0} SKUs)
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatCurrency(ord.totalAmount)}
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
                          Details
                        </Button>
                        {isViewer && ord.status === 'DELIVERED' && (
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-subtle">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onStatusUpdated={loadOrders}
          onRequestReturn={(ord) => setReturnOrder(ord)}
        />
      )}

      {/* Viewer Return Request Modal */}
      {returnOrder && (
        <ReturnRequestModal
          isOpen={!!returnOrder}
          onClose={() => setReturnOrder(null)}
          order={returnOrder}
          onSuccess={loadOrders}
        />
      )}
    </div>
  );
};
