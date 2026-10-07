import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StockStatusBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ProductFormModal } from '../../components/inventory/ProductFormModal';
import { ProductDetailsDrawer } from '../../components/inventory/ProductDetailsDrawer';
import { StockMovementModal } from '../../components/inventory/StockMovementModal';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const InventoryPage = () => {
  const { isAdmin, isStaff } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('productName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Drawers
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [inspectProduct, setInspectProduct] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  // When category changes, reload subcategories for filter
  useEffect(() => {
    if (categoryFilter) {
      productService.getSubcategories(categoryFilter).then((subs) => {
        setSubcategories(subs || []);
      }).catch(() => setSubcategories([]));
      setSubcategoryFilter('');
    } else {
      productService.getSubcategories().then((subs) => {
        setSubcategories(subs || []);
      }).catch(() => setSubcategories([]));
    }
  }, [categoryFilter]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, subRes, supRes] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getSubcategories(),
        productService.getSuppliers(),
      ]);

      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setSubcategories(Array.isArray(subRes) ? subRes : []);
      setSuppliers(Array.isArray(supRes) ? supRes : []);
    } catch (err) {
      const msg = err.message || 'Unable to load inventory data from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductTarget) return;
    try {
      await productService.deleteProduct(deleteProductTarget.id);
      showSuccess(`Product "${deleteProductTarget.productName}" deleted successfully`);
      setDeleteProductTarget(null);
      loadAllData();
    } catch (err) {
      showError(err.message || 'Failed to delete product');
    }
  };

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !categoryFilter ||
        String(p.category?.id || p.categoryId) === String(categoryFilter);

      const matchesSubcategory =
        !subcategoryFilter ||
        String(p.subcategory?.id || p.subcategoryId) === String(subcategoryFilter);

      const matchesSupplier =
        !supplierFilter ||
        String(p.supplier?.id || p.supplierId) === String(supplierFilter);

      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesSupplier && matchesStatus;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, searchTerm, categoryFilter, subcategoryFilter, supplierFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Stock Statuses' },
    { value: 'HEALTHY', label: 'Healthy' },
    { value: 'LOW_STOCK', label: 'Low Stock' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
    { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Master <span className="text-gold">Inventory</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Complete registry of all enterprise equipment, hardware assets, and consumables.
          </p>
        </div>
        <div className="flex gap-3">
          {isStaff && (
            <Button
              variant="outline"
              icon="activity"
              onClick={() => setStockModalProduct({})}
            >
              Stock Movement
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="primary"
              icon="plus"
              onClick={() => {
                setEditingProduct(null);
                setFormModalOpen(true);
              }}
            >
              Add New Product
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
            <Input
              placeholder="Search by name, SKU, or specs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon="search"
            />

            <Select
              placeholder="All Categories"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />

            <Select
              placeholder="All Subcategories"
              value={subcategoryFilter}
              onChange={(e) => {
                setSubcategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              disabled={subcategories.length === 0}
              options={[
                { value: '', label: 'All Subcategories' },
                ...subcategories.map((s) => ({ value: String(s.id), label: s.name })),
              ]}
            />

            <Select
              placeholder="All Suppliers"
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: '', label: 'All Suppliers' },
                ...suppliers.map((sup) => ({ value: String(sup.id), label: sup.name })),
              ]}
            />

            <Select
              placeholder="Stock Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-subtle">
            <span>
              Showing <strong>{filteredProducts.length}</strong> matching product(s)
            </span>
            {(searchTerm || categoryFilter || subcategoryFilter || supplierFilter || statusFilter) && (
              <button
                className="text-gold font-medium cursor-pointer"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setSubcategoryFilter('');
                  setSupplierFilter('');
                  setStatusFilter('');
                }}
                style={{ background: 'none', border: 'none' }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      {error ? (
        <ErrorState
          title="Unable to load inventory"
          message={error}
          onRetry={loadAllData}
        />
      ) : (
        <Card p={0}>
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton variant="table" count={6} />
            </div>
          ) : paginatedProducts.length === 0 ? (
          <EmptyState
            title="No Products Found"
            message="No products match your active search filters. Try adjusting your query or filters."
            icon="package"
            action={
              isAdmin ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormModalOpen(true);
                  }}
                >
                  Create Product
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>
                    <div className="flex items-center gap-1">
                      Product Name
                      {sortBy === 'productName' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={14} />
                      )}
                    </div>
                  </th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Supplier</th>
                  <th
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Stock
                      {sortBy === 'quantity' && (
                        <Icon name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={14} />
                      )}
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Cost</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Expiry</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div
                        className="font-semibold text-main cursor-pointer hover:text-gold"
                        onClick={() => setInspectProduct(product)}
                      >
                        {product.productName}
                      </div>
                      <span className="text-xs text-muted line-clamp-1">{product.description}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gold font-semibold">{product.sku}</span>
                    </td>
                    <td>
                      <span className="text-sm text-secondary">
                        {product.category?.name || product.categoryName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-muted">
                        {product.subcategory?.name || product.subcategoryName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-secondary truncate" style={{ maxWidth: '120px', display: 'block' }}>
                        {product.supplier?.name || product.supplierName || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-bold text-main">{product.quantity}</span>
                      <span className="text-xs text-muted block">min: {product.minimumStock}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatCurrency(product.purchasePrice)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StockStatusBadge status={product.status} />
                    </td>
                    <td className="text-xs text-muted">
                      {product.expiryDate ? formatDate(product.expiryDate) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="eye"
                          title="View Details"
                          onClick={() => setInspectProduct(product)}
                        />
                        {isStaff && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="activity"
                            title="Record Movement"
                            onClick={() => setStockModalProduct(product)}
                          />
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="edit"
                              title="Edit Product"
                              onClick={() => {
                                setEditingProduct(product);
                                setFormModalOpen(true);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="trash"
                              title="Delete Product"
                              style={{ color: '#f87171' }}
                              onClick={() => setDeleteProductTarget(product)}
                            />
                          </>
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

      {/* Reusable Product Form Modal (Admin) */}
      {formModalOpen && (
        <ProductFormModal
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSuccess={loadAllData}
        />
      )}

      {/* Slide-out Product Details Drawer */}
      {inspectProduct && (
        <ProductDetailsDrawer
          isOpen={!!inspectProduct}
          onClose={() => setInspectProduct(null)}
          product={inspectProduct}
          onProductUpdated={loadAllData}
        />
      )}

      {/* Stock Movement Intake/Adjust Modal */}
      {stockModalProduct && (
        <StockMovementModal
          isOpen={!!stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          product={stockModalProduct.id ? stockModalProduct : null}
          onSuccess={loadAllData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteProductTarget && (
        <ConfirmDialog
          isOpen={!!deleteProductTarget}
          title="Delete Product"
          message={`Are you sure you want to permanently delete "${deleteProductTarget.productName}" (SKU: ${deleteProductTarget.sku})? This action cannot be undone.`}
          confirmText="Delete Product"
          variant="danger"
          onClose={() => setDeleteProductTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
