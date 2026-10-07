import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StockStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ProductDetailsDrawer } from '../../components/inventory/ProductDetailsDrawer';
import { addToCart } from '../../redux/slices/cartSlice';
import { productService } from '../../services/productService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const BrowseProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'price-asc' | 'price-desc'
  const [inStockOnly, setInStockOnly] = useState(false);

  // Per-product local quantity selectors in card
  const [quantities, setQuantities] = useState({});

  // Slide-in drawer
  const [drawerProduct, setDrawerProduct] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('categoryId');
    if (q !== null) setSearchTerm(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err) {
      setError(err.message || 'Failed to load catalog');
      showError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, delta, maxStock) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const qty = quantities[product.id] || 1;
    dispatch(addToCart({ product, quantity: qty }));
    showSuccess(`Added ${qty} × "${product.productName}" to requisition cart`);
  };

  const filteredProducts = useMemo(() => {
    return (Array.isArray(products) ? products : []).filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        String(p.category?.id || p.categoryId) === String(selectedCategory);

      const matchesStock = !inStockOnly || p.quantity > 0;

      return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === 'price-desc') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      return (a.productName || '').localeCompare(b.productName || '');
    });
  }, [products, searchTerm, selectedCategory, inStockOnly, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Hardware & Supply <span className="text-gold">Catalog</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Browse available inventory, inspect equipment specifications, and prepare requisition orders.
          </p>
        </div>
      </div>

      {/* Filter and Control Ribbon */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
            <Input
              placeholder="Search by product name, SKU, or specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="search"
            />

            <Select
              placeholder="All Departments"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'name', label: 'Sort by Name (A-Z)' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
              ]}
            />

            <div className="flex items-center gap-2 pl-2">
              <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-subtle">
            <span>
              Showing <strong>{filteredProducts.length}</strong> items in stock catalog
            </span>
            {(searchTerm || selectedCategory || inStockOnly) && (
              <button
                className="text-gold cursor-pointer"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setInStockOnly(false);
                }}
                style={{ background: 'none', border: 'none' }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {error ? (
        <ErrorState
          title="Failed to Load Product Catalog"
          message={error}
          onRetry={loadCatalog}
        />
      ) : loading ? (
        <div className="grid grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
          <LoadingSkeleton variant="card" height={260} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found"
          message="No items match your active filters. Try clearing your search parameters."
          icon="package"
        />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            const itemQty = quantities[p.id] || 1;

            return (
              <div
                key={p.id}
                onClick={() => setDrawerProduct(p)}
                className="card p-5 flex flex-col justify-between cursor-pointer"
                style={{
                  background: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  opacity: isOutOfStock ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gold)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.4)';
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

                  <h3 className="font-bold text-base text-main mb-1 line-clamp-1">{p.productName}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge badge-default" style={{ fontSize: '0.65rem' }}>
                      {p.category?.name || 'General'}
                    </span>
                    {p.subcategory?.name && (
                      <span className="text-xs text-muted">/ {p.subcategory.name}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted mb-4 line-clamp-2" style={{ minHeight: '32px', lineHeight: 1.4 }}>
                    {p.description || 'Enterprise grade certified equipment with full warranty.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted block">Requisition Price</span>
                      <span className="text-gold font-bold text-xl font-heading">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      Available: <strong className="text-main">{p.quantity}</strong> units
                    </span>
                  </div>

                  {/* Quantity Stepper & Add Button */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex items-center rounded-md border border-subtle"
                      style={{ background: 'var(--bg-surface-2)', padding: '2px' }}
                    >
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 28, height: 28 }}
                        disabled={isOutOfStock || itemQty <= 1}
                        onClick={() => handleQuantityChange(p.id, -1, p.quantity)}
                      >
                        <Icon name="minus" size={14} />
                      </button>
                      <span
                        style={{
                          minWidth: '28px',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {itemQty}
                      </span>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: 28, height: 28 }}
                        disabled={isOutOfStock || itemQty >= p.quantity}
                        onClick={() => handleQuantityChange(p.id, 1, p.quantity)}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon="shopping-cart"
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(e, p)}
                    >
                      {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Product Details Drawer */}
      {drawerProduct && (
        <ProductDetailsDrawer
          isOpen={!!drawerProduct}
          onClose={() => setDrawerProduct(null)}
          product={drawerProduct}
          onProductUpdated={loadCatalog}
        />
      )}
    </div>
  );
};
