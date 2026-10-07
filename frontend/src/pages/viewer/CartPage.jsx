import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { updateQuantity, removeFromCart, clearCart } from '../../redux/slices/cartSlice';
import { orderService } from '../../services/orderService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  const { items, totalAmount } = useSelector((state) => state.cart);

  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // holds confirmed order object

  const handleUpdateQty = (productId, newQty, maxStock) => {
    if (newQty <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: Math.min(maxStock, newQty) }));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      showError('Please enter a delivery destination address');
      return;
    }

    setSubmitting(true);
    try {
      const validItems = items
        .map((i) => {
          const prodId = i.productId || i.id || i.product?.id;
          const price = Number(i.sellingPrice ?? i.unitPrice ?? i.product?.sellingPrice ?? 0);
          return {
            productId: prodId,
            quantity: Number(i.quantity || 1),
            unitPrice: price,
          };
        })
        .filter((it) => it.productId != null && !isNaN(it.productId));

      if (validItems.length === 0) {
        showError('Cart contains invalid items. Please clear and re-add from catalog.');
        setSubmitting(false);
        return;
      }

      const orderPayload = {
        orderType: 'SALE_ORDER',
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        items: validItems,
      };

      const created = await orderService.createOrder(orderPayload);
      showSuccess(`Order #${created.id} placed successfully!`);
      dispatch(clearCart());
      setOrderSuccess(created);
    } catch (err) {
      showError(err.message || 'Failed to place requisition order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(122, 154, 131, 0.2)',
          border: '2px solid var(--color-sage)',
          color: 'var(--color-sage)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
        }}>
          <Icon name="check" size={40} />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-main)',
          marginBottom: 8,
        }}>
          Requisition Confirmed!
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
          Your order has been recorded in the central fulfillment queue.
        </p>

        <Card>
          <div className="flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-subtle">
              <span className="text-muted text-xs">Order Tracking Reference</span>
              <span className="text-gold font-bold font-mono text-base">
                {orderSuccess.orderNumber || `#${orderSuccess.id}`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-subtle">
              <span className="text-muted text-xs">Destination Facility</span>
              <span className="text-main font-semibold text-sm">
                {orderSuccess.shippingAddress}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-xs">Total Requisition Value</span>
              <span className="text-gold font-bold text-lg font-heading">
                {formatCurrency(orderSuccess.totalAmount || totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            icon="arrow-left"
            onClick={() => navigate('/viewer/browse')}
          >
            Return to Catalog
          </Button>
          <Button
            variant="primary"
            icon="truck"
            onClick={() => navigate('/viewer/orders')}
          >
            Track in My Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Requisition <span className="text-gold">Cart & Checkout</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Review your selected hardware inventory items and confirm fulfillment dispatch.
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            style={{ color: '#f87171' }}
            onClick={() => dispatch(clearCart())}
          >
            Empty Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <EmptyState
            title="Your Requisition Cart is Empty"
            message="You have not selected any hardware or equipment items for order fulfillment yet."
            icon="shopping-cart"
            action={
              <Button
                variant="primary"
                icon="plus"
                onClick={() => navigate('/viewer/browse')}
              >
                Browse Catalog
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Cart Items List (2 Cols) */}
          <div style={{ gridColumn: 'span 2' }}>
            <Card p={0}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'center' }}>Quantity</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const prodId = item.productId || item.id || item.product?.id;
                      const name = item.productName || item.product?.productName || 'Hardware Product';
                      const sku = item.sku || item.product?.sku || 'N/A';
                      const price = Number(item.sellingPrice ?? item.unitPrice ?? item.product?.sellingPrice ?? 0);
                      const qty = Number(item.quantity || 1);
                      const maxStock = item.maxStock ?? item.product?.quantity ?? 999;
                      return (
                        <tr key={prodId || Math.random()}>
                          <td>
                            <span className="font-semibold text-main block">{name}</span>
                            <span className="text-xs text-gold font-mono">SKU: {sku}</span>
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                            {formatCurrency(price)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div
                              className="inline-flex items-center rounded-md border border-subtle"
                              style={{ background: 'var(--bg-surface-2)', padding: '2px' }}
                            >
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ width: 26, height: 26 }}
                                onClick={() =>
                                  handleUpdateQty(prodId, qty - 1, maxStock)
                                }
                              >
                                <Icon name="minus" size={12} />
                              </button>
                              <span
                                style={{
                                  minWidth: '32px',
                                  textAlign: 'center',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  color: 'var(--text-main)',
                                }}
                              >
                                {qty}
                              </span>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ width: 26, height: 26 }}
                                disabled={qty >= maxStock}
                                onClick={() =>
                                  handleUpdateQty(prodId, qty + 1, maxStock)
                                }
                              >
                                <Icon name="plus" size={12} />
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>
                            {formatCurrency(price * qty)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="trash"
                              style={{ color: '#f87171' }}
                              onClick={() => dispatch(removeFromCart(prodId))}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Checkout & Summary Panel (1 Col) */}
          <div>
            <Card title="Order Summary" subtitle="Requisition value and delivery details" icon="file-text">
              <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 pb-4 border-b border-subtle">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Total Line Items:</span>
                    <span className="font-semibold text-main">{items.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Total Units:</span>
                    <span className="font-semibold text-main">
                      {items.reduce((acc, i) => acc + i.quantity, 0)} units
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-subtle">
                    <span className="font-bold text-main">Total Requisition:</span>
                    <span className="font-bold text-xl text-gold font-heading">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Destination Facility</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Floor 4, Server Room B, Building 2"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Handling Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Fragile calibration equipment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon="check"
                  loading={submitting}
                >
                  Place Requisition Order
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
