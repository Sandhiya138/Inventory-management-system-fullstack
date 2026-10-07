import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StockStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { productService } from '../../services/productService';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const StockEntryPage = () => {
  const { showSuccess, showError } = useToast();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('STOCK_IN');
  const [quantity, setQuantity] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    loadProductsAndMovements();
  }, []);

  const loadProductsAndMovements = async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const [prods, movs] = await Promise.all([
        productService.getProducts(),
        productService.getStockMovements(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      const movList = Array.isArray(movs) ? movs : [];
      const sortedMovs = movList.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentMovements(sortedMovs.slice(0, 5));
    } catch (err) {
      setFetchError(err.message || 'Failed to load stock data');
      showError(err.message || 'Failed to load stock data');
    } finally {
      setFetchLoading(false);
    }
  };

  const selectedProduct = (Array.isArray(products) ? products : []).find((p) => String(p.id) === String(selectedProductId));

  // Compute calculated balance
  const currentQty = selectedProduct ? selectedProduct.quantity : 0;
  const numQty = parseInt(quantity, 10) || 0;
  const isAddition =
    movementType === 'STOCK_IN' ||
    movementType === 'PURCHASE' ||
    movementType === 'RETURN';
  const computedNewQty = selectedProduct
    ? isAddition
      ? currentQty + numQty
      : Math.max(0, currentQty - numQty)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      showError('Please select a product');
      return;
    }
    if (!quantity || numQty <= 0) {
      showError('Please enter a valid positive quantity');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: Number(selectedProductId),
        movementType,
        quantity: numQty,
        referenceNumber: referenceNumber.trim() || `ENTRY-${Date.now().toString().slice(-6)}`,
        reason: reason.trim() || `${movementType} entry by warehouse staff`,
      };

      await productService.recordStockMovement(payload);
      showSuccess(`Stock successfully updated for "${selectedProduct?.productName}". New quantity: ${computedNewQty}`);

      setQuantity('');
      setReferenceNumber('');
      setReason('');
      await loadProductsAndMovements();
    } catch (err) {
      showError(err.message || 'Failed to record stock entry');
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
            Warehouse <span className="text-gold">Stock Entry & Intake</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Log incoming shipments, physical count reconciliations, and inventory adjustments.
          </p>
        </div>
      </div>

      {fetchError ? (
        <ErrorState
          title="Failed to Load Stock Data"
          message={fetchError}
          onRetry={loadProductsAndMovements}
        />
      ) : fetchLoading ? (
        <div className="grid grid-cols-3 gap-6">
          <div style={{ gridColumn: 'span 2' }}>
            <LoadingSkeleton variant="card" height={380} />
          </div>
          <div>
            <LoadingSkeleton variant="card" height={380} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Entry Form (2 Cols) */}
          <div style={{ gridColumn: 'span 2' }}>
            <Card title="Record Physical Movement" subtitle="All adjustments are immediately reflected in inventory" icon="plus-circle">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Select
                label="Target Product"
                placeholder="Search or select a product..."
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                options={products.map((p) => ({
                  value: String(p.id),
                  label: `${p.productName} (SKU: ${p.sku}) — Current Stock: ${p.quantity}`,
                }))}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Movement Type"
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  options={[
                    { value: 'STOCK_IN', label: 'STOCK_IN (Warehouse Intake)' },
                    { value: 'PURCHASE', label: 'PURCHASE (Supplier PO Delivery)' },
                    { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Count Reconciliation)' },
                    { value: 'RETURN', label: 'RETURN (RMA Restock)' },
                    { value: 'STOCK_OUT', label: 'STOCK_OUT (Disposal / Damaged Goods)' },
                  ]}
                  required
                />

                <Input
                  label="Quantity to Move"
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Reference / Document Number"
                  placeholder="e.g. PO-9281, REC-410"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />

                <Input
                  label="Reason / Notes"
                  placeholder="e.g. Weekly replenishment shipment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Real-time Calculation Banner */}
              {selectedProduct && numQty > 0 && (
                <div
                  className="p-4 rounded-md flex items-center justify-between"
                  style={{
                    background: 'rgba(94, 25, 51, 0.25)',
                    border: '1px solid var(--color-gold)',
                  }}
                >
                  <div>
                    <span className="text-xs text-muted block">Projected Stock Update</span>
                    <span className="text-sm font-semibold text-main">
                      {selectedProduct.productName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted block">Current → Projected</span>
                    <span className="font-bold text-base text-main">
                      {currentQty} {isAddition ? '+' : '-'} {numQty} ={' '}
                      <span className="text-gold font-bold text-lg">{computedNewQty}</span> units
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon="check"
                  loading={loading}
                  disabled={!selectedProductId || !quantity}
                >
                  Commit Stock Movement
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Selected Product Specifications Preview */}
        <div>
          {selectedProduct ? (
            <Card title="Product Dossier" subtitle="Current warehouse metrics" icon="package">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Stock Status:</span>
                  <StockStatusBadge status={selectedProduct.status} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Current Quantity:</span>
                  <span className="font-bold text-gold text-lg">{selectedProduct.quantity}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Safety Min / Max:</span>
                  <span className="text-sm text-secondary font-medium">
                    {selectedProduct.minimumStock} / {selectedProduct.maximumStock}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Category:</span>
                  <span className="text-sm text-secondary">
                    {selectedProduct.category?.name || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Subcategory:</span>
                  <span className="text-sm text-secondary">
                    {selectedProduct.subcategory?.name || 'Standard'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Supplier:</span>
                  <span className="text-sm text-secondary truncate" style={{ maxWidth: '160px' }}>
                    {selectedProduct.supplier?.name || 'Direct'}
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Product Dossier" subtitle="Live specs & inventory gauges" icon="package">
              <p className="text-xs text-muted text-center py-8">
                Select a product from the form to inspect its current inventory level, safety thresholds, and vendor details.
              </p>
            </Card>
          )}

          {/* Quick Recent Entries list */}
          <div className="mt-4">
            <Card title="Recent Entries" subtitle="Latest warehouse transactions" icon="clock">
              {recentMovements.length === 0 ? (
                <p className="text-xs text-muted">No recent movements.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentMovements.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded flex items-center justify-between text-xs"
                      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <div>
                        <span className="font-semibold text-main block">{m.product?.productName}</span>
                        <span className="text-muted">{formatDateTime(m.createdAt)}</span>
                      </div>
                      <span className="font-bold text-gold">
                        {m.movementType === 'STOCK_IN' || m.movementType === 'PURCHASE' ? '+' : '-'}
                        {m.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
