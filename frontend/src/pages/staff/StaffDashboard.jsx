import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StockStatusBadge, OrderStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { StockMovementModal } from '../../components/inventory/StockMovementModal';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { messageService } from '../../services/messageService';
import { notificationService } from '../../services/notificationService';
import { reportService } from '../../services/reportService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  // Per-section error tracking for graceful partial failures
  const [sectionErrors, setSectionErrors] = useState({
    products: null,
    orders: null,
    returns: null,
    movements: null,
    notifications: null,
    conversations: null,
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [movements, setMovements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);

  // Modals
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadStaffData = useCallback(async () => {
    setInitialLoading(true);
    setGlobalError(null);

    // Failsafe timeout: guarantee loading state finishes within 3.5s under any circumstance
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setInitialLoading(false);
      }
    }, 3500);

    try {
      const [prodRes, ordRes, retRes, movRes, notifRes, convRes, invRes] = await Promise.allSettled([
        productService.getProducts(),
        orderService.getOrders(),
        orderService.getReturns(),
        productService.getStockMovements(),
        notificationService.getNotifications(),
        messageService.getConversations(),
        reportService.getInventoryReport(),
      ]);

      if (!isMounted.current) return;

      const newSectionErrors = {
        products: prodRes.status === 'rejected' ? (prodRes.reason?.message || 'Failed to load products') : null,
        orders: ordRes.status === 'rejected' ? (ordRes.reason?.message || 'Failed to load orders') : null,
        returns: retRes.status === 'rejected' ? (retRes.reason?.message || 'Failed to load returns') : null,
        movements: movRes.status === 'rejected' ? (movRes.reason?.message || 'Failed to load stock movements') : null,
        notifications: notifRes.status === 'rejected' ? (notifRes.reason?.message || 'Failed to load notifications') : null,
        conversations: convRes.status === 'rejected' ? (convRes.reason?.message || 'Failed to load messages') : null,
      };
      setSectionErrors(newSectionErrors);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value)) {
        setOrders(ordRes.value);
      }
      if (retRes.status === 'fulfilled' && Array.isArray(retRes.value)) {
        setReturns(retRes.value);
      }
      if (movRes.status === 'fulfilled' && Array.isArray(movRes.value)) {
        const sortedMov = [...movRes.value].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMovements(sortedMov);
      }
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value)) {
        setNotifications(notifRes.value);
      }
      if (convRes.status === 'fulfilled' && Array.isArray(convRes.value)) {
        setConversations(convRes.value);
      }
      if (invRes.status === 'fulfilled' && invRes.value) {
        setInventoryReport(invRes.value);
      }

      // If both core entities (products and orders) completely failed, set global offline banner
      if (prodRes.status === 'rejected' && ordRes.status === 'rejected') {
        setGlobalError('Unable to load dashboard data. The backend server might be restarting or unreachable.');
      }
    } catch (err) {
      if (isMounted.current) {
        setGlobalError(err.message || 'Unable to load dashboard data.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  // Section-specific retry helpers
  const retrySection = async (section) => {
    try {
      if (section === 'products') {
        const data = await productService.getProducts();
        if (Array.isArray(data)) setProducts(data);
        setSectionErrors((prev) => ({ ...prev, products: null }));
      } else if (section === 'orders') {
        const data = await orderService.getOrders();
        if (Array.isArray(data)) setOrders(data);
        setSectionErrors((prev) => ({ ...prev, orders: null }));
      } else if (section === 'returns') {
        const data = await orderService.getReturns();
        if (Array.isArray(data)) setReturns(data);
        setSectionErrors((prev) => ({ ...prev, returns: null }));
      } else if (section === 'movements') {
        const data = await productService.getStockMovements();
        if (Array.isArray(data)) setMovements([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setSectionErrors((prev) => ({ ...prev, movements: null }));
      } else if (section === 'notifications') {
        const data = await notificationService.getNotifications();
        if (Array.isArray(data)) setNotifications(data);
        setSectionErrors((prev) => ({ ...prev, notifications: null }));
      } else if (section === 'conversations') {
        const data = await messageService.getConversations();
        if (Array.isArray(data)) setConversations(data);
        setSectionErrors((prev) => ({ ...prev, conversations: null }));
      }
    } catch (err) {
      console.error(`Retry failed for ${section}:`, err);
    }
  };

  // Safe Calculations using real backend data
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeReturns = Array.isArray(returns) ? returns : [];
  const safeMovements = Array.isArray(movements) ? movements : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const totalProducts = safeProducts.length;
  const totalStockUnits = safeProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const lowStockCount = safeProducts.filter((p) => p.status === 'LOW_STOCK').length;
  const criticalStockCount = safeProducts.filter((p) => p.status === 'CRITICAL').length;
  const outOfStockCount = safeProducts.filter((p) => p.status === 'OUT_OF_STOCK' || (p.quantity || 0) <= 0).length;
  
  // Real-time Inventory Value in INR (₹) synchronized with Admin Inventory valuation
  const totalInventoryValue = inventoryReport?.totalInventoryValue !== undefined
    ? inventoryReport.totalInventoryValue
    : safeProducts.reduce(
        (acc, p) => acc + (Number(p.sellingPrice) || Number(p.purchasePrice) || 0) * (p.quantity || 0),
        0
      );

  const pendingOrders = safeOrders.filter((o) => o.status === 'PENDING');
  const processingOrders = safeOrders.filter((o) => o.status === 'PROCESSING' || o.status === 'PACKED');
  const pendingReturns = safeReturns.filter((r) => r.status === 'REQUESTED');
  
  const criticalItems = safeProducts.filter(
    (p) => p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK' || p.status === 'LOW_STOCK'
  ).slice(0, 6);

  if (initialLoading) {
    return (
      <div className="flex flex-col gap-6 animate-fade">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-4 gap-4">
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
          <LoadingSkeleton variant="card" height={105} />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div style={{ gridColumn: 'span 2' }}>
            <LoadingSkeleton variant="card" height={320} />
          </div>
          <div>
            <LoadingSkeleton variant="card" height={320} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Warehouse Operations & <span className="text-terracotta">Fulfillment Hub</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-time multi-channel inventory intake, order fulfillment queues, and threshold alerts.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setStockModalOpen(true)}
          >
            Record Stock Entry
          </Button>
          <Button
            variant="outline"
            icon="truck"
            onClick={() => navigate('/orders')}
          >
            Fulfillment Queue
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <ErrorState
          title="Unable to load dashboard data."
          message={globalError}
          onRetry={loadStaffData}
        />
      )}

      {/* Top 4 Primary Status Cards: Valuation & Stock Ratios */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon="package"
          variant="gold"
          subtitle={`${safeProducts.length} catalog items`}
        />
        <StatCard
          title="Total Stock Units"
          value={totalStockUnits.toLocaleString('en-IN')}
          icon="inventory"
          variant="wine"
          subtitle="Physical on-hand units"
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          icon="currency"
          variant="gold"
          trend={{ direction: 'up', text: 'Live valuation' }}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          icon="alert-circle"
          variant="terracotta"
          subtitle="Zero quantity SKUs"
        />
      </div>

      {/* Secondary 4 Status Cards: Fulfillment & Critical Alert Queues */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Low Stock Warning"
          value={lowStockCount}
          icon="alert-triangle"
          variant="gold"
          subtitle="Below safety buffer"
        />
        <StatCard
          title="Critical Minimum"
          value={criticalStockCount}
          icon="alert-circle"
          variant="terracotta"
          subtitle="Immediate intake needed"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.length}
          icon="clock"
          variant="wine"
          subtitle="Awaiting staff review"
        />
        <StatCard
          title="Processing Orders"
          value={processingOrders.length}
          icon="truck"
          variant="sage"
          subtitle="In packing / dispatch"
        />
      </div>

      {/* Main Operations Split */}
      <div className="grid grid-cols-3 gap-6">
        {/* Urgent Stock Replenishment Watchlist (2 Cols) */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card
            title="Stock Replenishment Alerts"
            subtitle="Products that have reached or breached safety thresholds"
            icon="alert-triangle"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon="arrow-right"
                onClick={() => navigate('/inventory')}
              >
                Full Inventory
              </Button>
            }
          >
            {sectionErrors.products ? (
              <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
                <span className="text-coral">Unable to load stock alerts: {sectionErrors.products}</span>
                <Button size="sm" variant="ghost" onClick={() => retrySection('products')}>
                  Retry
                </Button>
              </div>
            ) : criticalItems.length === 0 ? (
              <EmptyState
                title="All Stock Levels Optimal"
                message="No products currently breached minimum safety thresholds."
                icon="check-circle"
              />
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'center' }}>Current Stock</th>
                      <th style={{ textAlign: 'center' }}>Thresholds (Min/Max)</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalItems.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span className="font-semibold text-main block">{p.productName}</span>
                          <span className="text-xs text-muted">SKU: {p.sku}</span>
                        </td>
                        <td className="text-sm text-secondary">{p.category?.name || p.categoryName || 'General'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-coral)' }}>
                          {p.quantity}
                        </td>
                        <td style={{ textAlign: 'center' }} className="text-xs text-muted">
                          {p.minimumStock} / {p.maximumStock}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StockStatusBadge status={p.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="wine"
                            size="sm"
                            onClick={() => navigate('/staff/stock-entry')}
                          >
                            Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Return Claims Queue (1 Col) */}
        <div>
          <Card
            title="Pending Returns Queue"
            subtitle="Customer return authorizations"
            icon="returns"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/returns')}
              >
                Manage
              </Button>
            }
          >
            {sectionErrors.returns ? (
              <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
                <span className="text-coral">Unable to load returns</span>
                <Button size="sm" variant="ghost" onClick={() => retrySection('returns')}>
                  Retry
                </Button>
              </div>
            ) : pendingReturns.length === 0 ? (
              <p className="text-muted text-sm py-8 text-center">No pending return claims in queue.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingReturns.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-md"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gold">Return #{r.id}</span>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        {r.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted block mb-1">
                      Order #{r.order?.id} - {r.order?.viewer?.fullName || 'Viewer'}
                    </span>
                    <p className="text-xs text-main m-0 italic">"{r.reason}"</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Operational Grids: Recent Activity & Orders Waiting to Ship */}
      <div className="grid grid-cols-2 gap-6">
        {/* Movements Activity Audit */}
        <Card
          title="Stock Activity & Movement Log"
          subtitle="Real-time intake, shipment, and adjustment logs"
          icon="activity"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon="arrow-right"
              onClick={() => navigate('/stock-movements')}
            >
              All Movements
            </Button>
          }
        >
          {sectionErrors.movements ? (
            <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
              <span className="text-coral">Unable to load movements activity</span>
              <Button size="sm" variant="ghost" onClick={() => retrySection('movements')}>
                Retry
              </Button>
            </div>
          ) : safeMovements.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No physical stock movements recorded.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'center' }}>Change</th>
                    <th style={{ textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {safeMovements.slice(0, 6).map((m) => {
                    const isPositive =
                      m.movementType === 'STOCK_IN' ||
                      m.movementType === 'PURCHASE' ||
                      m.movementType === 'RETURN';
                    return (
                      <tr key={m.id}>
                        <td>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.7rem',
                              background: isPositive ? 'rgba(122, 154, 131, 0.2)' : 'rgba(200, 90, 56, 0.2)',
                              color: isPositive ? 'var(--color-sage)' : 'var(--color-terracotta)',
                            }}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm font-semibold text-main block">
                            {m.product?.productName}
                          </span>
                          <span className="text-xs text-muted">{m.reason || 'Warehouse entry'}</span>
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            fontWeight: 700,
                            color: isPositive ? 'var(--color-sage)' : 'var(--color-coral)',
                          }}
                        >
                          {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '0.75rem' }} className="text-muted">
                          {formatDateTime(m.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Immediate Orders Waiting to Ship */}
        <Card
          title="Recent Orders Queue"
          subtitle="Orders requiring warehouse picking & packaging"
          icon="truck"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              All Orders
            </Button>
          }
        >
          {sectionErrors.orders ? (
            <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
              <span className="text-coral">Unable to load orders queue</span>
              <Button size="sm" variant="ghost" onClick={() => retrySection('orders')}>
                Retry
              </Button>
            </div>
          ) : safeOrders.length === 0 ? (
            <p className="text-muted text-sm py-8 text-center">No orders currently awaiting processing.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...safeOrders]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 6)
                    .map((ord) => (
                      <tr key={ord.id}>
                        <td className="font-semibold text-gold">#{ord.id}</td>
                        <td>
                          <span className="text-sm text-main block">
                            {ord.viewer?.fullName || 'Customer'}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDate(ord.createdAt)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-cream)' }}>
                          {formatCurrency(ord.totalAmount)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <OrderStatusBadge status={ord.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Communications & Notifications Stream */}
      <div className="grid grid-cols-2 gap-6">
        {/* Messages Widget */}
        <Card
          title="Team Messages"
          subtitle="Direct warehouse and admin inquiries"
          icon="messages"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
            >
              Open Messaging
            </Button>
          }
        >
          {sectionErrors.conversations ? (
            <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
              <span className="text-coral">Unable to load messages</span>
              <Button size="sm" variant="ghost" onClick={() => retrySection('conversations')}>
                Retry
              </Button>
            </div>
          ) : safeConversations.length === 0 ? (
            <p className="text-muted text-sm py-6 text-center">No active communications.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {safeConversations.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/messages')}
                  className="p-3 rounded-md cursor-pointer flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span className="text-sm font-semibold text-main block">
                      {c.title || `Conversation #${c.id}`}
                    </span>
                    <span className="text-xs text-muted">
                      Type: {c.type || 'GENERAL'}
                    </span>
                  </div>
                  <span className="text-xs text-gold">Open Thread &rarr;</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications Widget */}
        <Card
          title="Alerts & System Notices"
          subtitle="Operational events and threshold triggers"
          icon="bell"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              View All
            </Button>
          }
        >
          {sectionErrors.notifications ? (
            <div className="p-4 flex items-center justify-between text-sm rounded" style={{ background: 'rgba(224, 109, 83, 0.1)' }}>
              <span className="text-coral">Unable to load notifications</span>
              <Button size="sm" variant="ghost" onClick={() => retrySection('notifications')}>
                Retry
              </Button>
            </div>
          ) : safeNotifications.length === 0 ? (
            <p className="text-muted text-sm py-6 text-center">No unread alerts or notifications.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {safeNotifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-md flex items-start justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span className="text-sm font-semibold text-main block">{n.title}</span>
                    <span className="text-xs text-muted">{n.message}</span>
                  </div>
                  <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Stock Movement Modal */}
      {stockModalOpen && (
        <StockMovementModal
          isOpen={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          onSuccess={loadStaffData}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onStatusUpdated={loadStaffData}
        />
      )}
    </div>
  );
};
