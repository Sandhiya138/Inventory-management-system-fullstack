import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { StockMovementModal } from '../../components/inventory/StockMovementModal';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatters';

export const StockMovementsPage = () => {
  const { isStaff, isAdmin } = useAuth();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const [movRes, prodRes] = await Promise.all([
        productService.getStockMovements(),
        productService.getProducts(),
      ]);
      setMovements(Array.isArray(movRes) ? movRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch (err) {
      const msg = err.message || 'Unable to load stock history from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        !searchTerm ||
        m.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter || m.movementType === typeFilter;
      const matchesProduct =
        !productFilter || String(m.product?.id || m.productId) === String(productFilter);

      return matchesSearch && matchesType && matchesProduct;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [movements, searchTerm, typeFilter, productFilter]);

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getMovementBadge = (type) => {
    switch (type) {
      case 'STOCK_IN':
      case 'PURCHASE':
        return <span className="badge badge-success">{type}</span>;
      case 'STOCK_OUT':
      case 'SALE':
        return <span className="badge badge-danger">{type}</span>;
      case 'ADJUSTMENT':
        return <span className="badge badge-warning">{type}</span>;
      case 'RETURN':
        return <span className="badge badge-info">{type}</span>;
      default:
        return <span className="badge badge-default">{type}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Inventory <span className="text-gold">Audit & Movement Ledger</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Immutable transaction log of all warehouse intake, customer fulfillment, and physical adjustments.
          </p>
        </div>
        {(isStaff || isAdmin) && (
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setModalOpen(true)}
          >
            Record Stock Change
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <Input
            placeholder="Search by reference #, reason, product name, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            icon="search"
          />

          <Select
            placeholder="All Movement Types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Movement Types' },
              { value: 'STOCK_IN', label: 'STOCK_IN (Warehouse Intake)' },
              { value: 'PURCHASE', label: 'PURCHASE (Vendor PO)' },
              { value: 'SALE', label: 'SALE (Viewer Dispatch)' },
              { value: 'STOCK_OUT', label: 'STOCK_OUT (Disposal / Damaged)' },
              { value: 'ADJUSTMENT', label: 'ADJUSTMENT (Cycle Count Reconciliation)' },
              { value: 'RETURN', label: 'RETURN (RMA Restock)' },
            ]}
          />

          <Select
            placeholder="All Products"
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: '', label: 'All Products' },
              ...products.map((p) => ({ value: String(p.id), label: `${p.productName} (${p.sku})` })),
            ]}
          />
        </div>
      </Card>

      {/* Movements Table */}
      {error ? (
        <ErrorState
          title="Unable to load stock history"
          message={error}
          onRetry={loadMovements}
        />
      ) : (
        <Card p={0}>
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table" count={6} />
            </div>
          ) : paginatedMovements.length === 0 ? (
          <EmptyState
            title="No Movements Logged"
            message="No stock movement records match your search query."
            icon="activity"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Reference #</th>
                  <th style={{ textAlign: 'center' }}>Previous</th>
                  <th style={{ textAlign: 'center' }}>Change</th>
                  <th style={{ textAlign: 'center' }}>New Balance</th>
                  <th>Reason / Notes</th>
                  <th>Logged By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMovements.map((m) => {
                  const isPositive =
                    m.movementType === 'STOCK_IN' ||
                    m.movementType === 'PURCHASE' ||
                    m.movementType === 'RETURN';

                  return (
                    <tr key={m.id}>
                      <td>{getMovementBadge(m.movementType)}</td>
                      <td>
                        <span className="font-semibold text-main block">{m.product?.productName}</span>
                        <span className="text-xs text-gold font-mono">{m.product?.sku}</span>
                      </td>
                      <td className="font-mono text-xs text-muted">
                        {m.referenceNumber || `MOV-${m.id}`}
                      </td>
                      <td style={{ textAlign: 'center' }} className="text-muted">
                        {m.previousStock ?? '—'}
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
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                        {m.newStock ?? '—'}
                      </td>
                      <td className="text-xs text-secondary" style={{ maxWidth: '220px' }}>
                        {m.reason || 'General inventory adjustment'}
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-main block">
                          {m.performedBy?.fullName || 'System'}
                        </span>
                        <span className="text-xs text-muted">
                          {m.performedBy?.role || ''}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {formatDateTime(m.createdAt)}
                      </td>
                    </tr>
                  );
                })}
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

      {/* Stock Movement Modal */}
      {modalOpen && (
        <StockMovementModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={loadMovements}
        />
      )}
    </div>
  );
};
