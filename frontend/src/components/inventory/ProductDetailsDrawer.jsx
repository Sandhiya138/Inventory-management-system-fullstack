import React from 'react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { StockStatusBadge } from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../icons/Icons';

export const ProductDetailsDrawer = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onRecordMovement,
  onAddToCart,
}) => {
  const { isAdmin, isStaff, isViewer } = useAuth();

  if (!product) return null;

  // Stock utilization percentage
  const maxStock = product.maximumStock || 100;
  const stockPercent = Math.min(100, Math.round(((product.quantity || 0) / maxStock) * 100));

  // Profit Margin
  const profit = (product.sellingPrice || 0) - (product.purchasePrice || 0);
  const margin = product.purchasePrice > 0 ? ((profit / product.purchasePrice) * 100).toFixed(1) : 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product.productName}
      subtitle={`SKU: ${product.sku}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {(isAdmin || isStaff) && (
              <Button
                variant="wine"
                size="sm"
                icon="plus"
                onClick={() => {
                  onClose();
                  onRecordMovement(product);
                }}
              >
                Stock Movement
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                icon="edit"
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
              >
                Edit
              </Button>
            )}
            {isViewer && (
              <Button
                variant="primary"
                size="sm"
                icon="cart"
                disabled={product.quantity <= 0}
                onClick={() => {
                  onAddToCart(product);
                }}
              >
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 rounded-md" style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)' }}>
          <div>
            <span className="text-muted text-xs block mb-1">Status</span>
            <StockStatusBadge status={product.status} />
          </div>
          <div className="text-right">
            <span className="text-muted text-xs block mb-1">Selling Price</span>
            <span className="text-gold font-bold text-xl font-heading">
              {formatCurrency(product.sellingPrice)}
            </span>
          </div>
        </div>

        {/* Stock Level Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-secondary">Inventory Level</span>
            <span className="text-sm font-bold text-main">
              {product.quantity} / {product.maximumStock} units
            </span>
          </div>
          <div
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${stockPercent}%`,
                background:
                  product.quantity <= product.minimumStock
                    ? 'var(--color-coral)'
                    : 'var(--gradient-terracotta)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Min Alert: {product.minimumStock}</span>
            <span>Capacity: {product.maximumStock}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Category</span>
            <span className="text-main font-semibold text-sm">
              {product.categoryName || 'Uncategorized'}
            </span>
          </div>
          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Subcategory</span>
            <span className="text-main font-semibold text-sm">
              {product.subcategoryName || '—'}
            </span>
          </div>

          {(isAdmin || isStaff) && (
            <>
              <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
                <span className="text-muted text-xs block">Purchase Cost</span>
                <span className="text-main font-semibold text-sm">
                  {formatCurrency(product.purchasePrice)}
                </span>
              </div>
              <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
                <span className="text-muted text-xs block">Estimated Margin</span>
                <span className="text-sage font-semibold text-sm">
                  +{margin}% ({formatCurrency(profit)})
                </span>
              </div>
            </>
          )}

          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Supplier</span>
            <span className="text-main font-semibold text-sm">
              {product.supplierName || 'Direct'}
            </span>
          </div>

          <div className="card p-3" style={{ background: 'var(--bg-surface-1)' }}>
            <span className="text-muted text-xs block">Expiry Date</span>
            <span className="text-main font-semibold text-sm">
              {product.expiryDate ? formatDate(product.expiryDate) : 'Non-perishable'}
            </span>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-2">Specifications</h4>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
};
