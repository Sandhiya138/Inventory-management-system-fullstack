import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StockStatusBadge, OrderStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ProductDetailsDrawer } from '../../components/inventory/ProductDetailsDrawer';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { addToCart } from '../../redux/slices/cartSlice';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const ViewerHomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess } = useToast();
  const { items: cartItems, totalAmount: cartTotal } = useSelector((state) => state.cart);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadViewerData = useCallback(async () => {
    setLoading(true);

    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    }, 3500);

    try {
      const [prodRes, catRes, ordRes] = await Promise.allSettled([
        productService.getProducts(),
        productService.getCategories(),
        orderService.getMyOrders(),
      ]);

      if (!isMounted.current) return;

      if (prodRes.status === 'fulfilled') setProducts(Array.isArray(prodRes.value) ? prodRes.value : []);
      if (catRes.status === 'fulfilled') setCategories(Array.isArray(catRes.value) ? catRes.value : []);
      if (ordRes.status === 'fulfilled') {
        const ordList = Array.isArray(ordRes.value) ? ordRes.value : [];
        const sorted = ordList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sorted.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading viewer data:', err);
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadViewerData();
  }, [loadViewerData]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    showSuccess(`Added "${product.productName}" to cart!`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/viewer/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/viewer/browse');
    }
  };

  // Featured products: in-stock items
  const featuredProducts = (Array.isArray(products) ? products : [])
    .filter((p) => p.status === 'HEALTHY' || p.status === 'LOW_STOCK')
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="card" height={180} />
        <div className="grid grid-cols-4 gap-4">
          <LoadingSkeleton variant="card" height={120} />
          <LoadingSkeleton variant="card" height={120} />
          <LoadingSkeleton variant="card" height={120} />
          <LoadingSkeleton variant="card" height={120} />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Luxury Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #421226 0%, #1e0a29 55%, #8a3418 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '38px 36px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '620px', position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#f1cb68',
            fontWeight: 700,
            display: 'block',
            marginBottom: '8px',
          }}>
            Catalog & Requisition Portal
          </span>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: '#ffffff',
            margin: '0 0 12px 0',
            lineHeight: 1.2,
          }}>
            Discover & Request Premium <span style={{ color: '#f1cb68' }}>Hardware & Supplies</span>
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.88)',
            fontSize: '0.95rem',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}>
            Browse company stock, track active delivery dispatches, and request returns with instant inventory tracking.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search products by SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  borderColor: 'rgba(212, 175, 55, 0.4)',
                  paddingLeft: '38px',
                  height: '44px',
                  width: '100%',
                }}
              />
              <div style={{ position: 'absolute', left: '12px', top: '12px', color: '#f1cb68' }}>
                <Icon name="search" size={18} />
              </div>
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Live Catalog Stock & Inventory Valuation Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Catalog SKUs"
          value={products.length}
          icon="package"
          variant="gold"
          subtitle="Available for order"
        />
        <StatCard
          title="Stock In Warehouse"
          value={products.reduce((acc, p) => acc + (p.quantity || 0), 0).toLocaleString('en-IN')}
          icon="inventory"
          variant="wine"
          subtitle="Physical on-hand units"
        />
        <StatCard
          title="Total Stock Value"
          value={formatCurrency(products.reduce((acc, p) => acc + (Number(p.sellingPrice) || 0) * (p.quantity || 0), 0))}
          icon="currency"
          variant="gold"
          trend={{ direction: 'up', text: 'Live valuation' }}
        />
        <StatCard
          title="My Orders"
          value={recentOrders.length}
          icon="truck"
          variant="terracotta"
          subtitle="Track dispatches & status"
        />
      </div>

      {/* Category Pills & Shortcuts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading text-main">Shop by Department</h2>
          <Button
            variant="ghost"
            size="sm"
            icon="arrow-right"
            onClick={() => navigate('/viewer/browse')}
          >
            All Departments
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/viewer/browse?categoryId=${cat.id}`)}
              className="card p-4 flex flex-col items-center justify-center text-center cursor-pointer"
              style={{
                transition: 'all 0.2s ease',
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(94, 25, 51, 0.3)',
                  color: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Icon name="folder" size={24} />
              </div>
              <span className="font-semibold text-sm text-main block">{cat.name}</span>
              <span className="text-xs text-muted mt-1">{cat.subcategories?.length || 0} categories</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-main">Featured Available Inventory</h2>
            <p className="text-xs text-muted">Ready for immediate internal transfer or order placement</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/viewer/browse')}
          >
            Browse Full Catalog
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="card p-5 flex flex-col justify-between cursor-pointer"
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted font-mono">{p.sku}</span>
                  <StockStatusBadge status={p.status} />
                </div>
                <h3 className="font-semibold text-base text-main mb-2 line-clamp-1">{p.productName}</h3>
                <p className="text-xs text-muted mb-4 line-clamp-2" style={{ minHeight: '32px' }}>
                  {p.description || 'Enterprise grade certified equipment.'}
                </p>
              </div>

              <div className="pt-3 border-t border-subtle flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted block">Price</span>
                  <span className="text-gold font-bold text-lg">{formatCurrency(p.sellingPrice)}</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon="shopping-cart"
                  onClick={(e) => handleAddToCart(e, p)}
                  disabled={p.quantity <= 0}
                >
                  {p.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Cart Status & Recent Order Tracking */}
      <div className="grid grid-cols-3 gap-6">
        {/* Cart Quick Preview */}
        <div className="card p-5" style={{ background: 'var(--bg-surface-1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="shopping-cart" size={20} className="text-gold" />
              <h3 className="text-base font-bold text-main">Your Requisition Cart</h3>
            </div>
            <span className="badge badge-gold">{cartItems.length} items</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted text-sm mb-3">Your cart is currently empty.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/viewer/browse')}
              >
                Browse Items
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-2 mb-4">
                {cartItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm py-1 border-b border-subtle"
                  >
                    <span className="text-secondary truncate" style={{ maxWidth: '180px' }}>
                      {item.productName}
                    </span>
                    <span className="font-semibold text-main">
                      {item.quantity} × {formatCurrency(item.sellingPrice)}
                    </span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <span className="text-xs text-muted text-center pt-1">
                    +{cartItems.length - 3} more items in cart
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-subtle mb-4">
                <span className="text-sm font-semibold text-muted">Subtotal:</span>
                <span className="text-lg font-bold text-gold">{formatCurrency(cartTotal)}</span>
              </div>

              <Button
                variant="primary"
                fullWidth
                icon="arrow-right"
                onClick={() => navigate('/viewer/cart')}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>

        {/* Recent Orders Tracking */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card
            title="Recent Order Tracking"
            subtitle="Live status updates on your shipments"
            icon="truck"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/viewer/orders')}
              >
                Order History
              </Button>
            }
          >
            {recentOrders.length === 0 ? (
              <p className="text-muted text-sm py-4">You have not placed any orders yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-md flex items-center justify-between"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gold text-sm">Order #{ord.id}</span>
                        <OrderStatusBadge status={ord.status} />
                      </div>
                      <span className="text-xs text-muted block">
                        Placed on {formatDate(ord.createdAt)} • {ord.orderItems?.length || 0} items
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-main text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        Track Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Product Drawer */}
      {selectedProduct && (
        <ProductDetailsDrawer
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onProductUpdated={loadViewerData}
        />
      )}

      {/* Order Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onStatusUpdated={loadViewerData}
        />
      )}
    </div>
  );
};
