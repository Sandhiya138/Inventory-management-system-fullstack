import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/icons/Icons';

export const CategoriesPage = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Subcategory Modal
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', description: '' });

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category' | 'subcategory', item }

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        productService.getCategories(),
        productService.getProducts(),
      ]);
      const catList = Array.isArray(cats) ? cats : [];
      const prodList = Array.isArray(prods) ? prods : [];
      setCategories(catList);
      setProducts(prodList);
      if (catList.length > 0 && !selectedCategory) {
        setSelectedCategory(catList[0]);
      } else if (catList.length > 0 && selectedCategory) {
        const updatedSelected = catList.find((c) => c.id === selectedCategory.id) || catList[0];
        setSelectedCategory(updatedSelected);
      }
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      showError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showError('Category name is required');
      return;
    }
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, categoryForm);
        showSuccess(`Category "${categoryForm.name}" updated successfully`);
      } else {
        await productService.createCategory(categoryForm);
        showSuccess(`Category "${categoryForm.name}" created successfully`);
      }
      setCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      showError(err.message || 'Failed to save category');
    }
  };

  // Subcategory CRUD
  const handleOpenSubcategoryModal = (sub = null) => {
    if (!selectedCategory) return;
    if (sub) {
      setEditingSubcategory(sub);
      setSubcategoryForm({ name: sub.name, description: sub.description || '' });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({ name: '', description: '' });
    }
    setSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryForm.name.trim()) {
      showError('Subcategory name is required');
      return;
    }
    try {
      const payload = {
        name: subcategoryForm.name,
        description: subcategoryForm.description,
        categoryId: selectedCategory.id,
      };
      if (editingSubcategory) {
        await productService.updateSubcategory(editingSubcategory.id, payload);
        showSuccess(`Subcategory "${subcategoryForm.name}" updated successfully`);
      } else {
        await productService.createSubcategory(payload);
        showSuccess(`Subcategory "${subcategoryForm.name}" created successfully`);
      }
      setSubcategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      showError(err.message || 'Failed to save subcategory');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'category') {
        await productService.deleteCategory(deleteTarget.item.id);
        showSuccess(`Category "${deleteTarget.item.name}" deleted successfully`);
        setSelectedCategory(null);
      } else {
        await productService.deleteSubcategory(deleteTarget.item.id);
        showSuccess(`Subcategory "${deleteTarget.item.name}" deleted successfully`);
      }
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      showError(err.message || `Failed to delete ${deleteTarget.type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="title" />
        <div className="grid grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" height={360} />
          <div style={{ gridColumn: 'span 2' }}>
            <LoadingSkeleton variant="card" height={360} />
          </div>
        </div>
      </div>
    );
  }

  // Count products by subcategory
  const getSubcategoryProductCount = (subId) => {
    return (Array.isArray(products) ? products : []).filter((p) => (p.subcategory?.id || p.subcategoryId) === subId).length;
  };

  // Count products by category
  const getCategoryProductCount = (catId) => {
    return (Array.isArray(products) ? products : []).filter((p) => (p.category?.id || p.categoryId) === catId).length;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Taxonomy & <span className="text-gold">Department Architecture</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage multi-tier hierarchical classifications (Category → Subcategories → Products).
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon="plus"
            onClick={() => handleOpenCategoryModal()}
          >
            Add New Category
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState
          title="Failed to Load Categories"
          message={error}
          onRetry={loadCategories}
        />
      ) : (
        /* Main Two-Pane Split */
        <div className="grid grid-cols-3 gap-6">
          {/* Left Pane: Categories List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Categories ({categories.length})
            </h3>

          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const prodCount = getCategoryProductCount(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="card p-4 cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(94, 25, 51, 0.35)' : 'var(--bg-surface-1)',
                    borderColor: isSelected ? 'var(--color-gold)' : 'var(--border-subtle)',
                    boxShadow: isSelected ? '0 0 20px rgba(212, 175, 55, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--gradient-burgundy)' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--color-gold)' : 'var(--text-muted)',
                        }}
                      >
                        <Icon name="folder" size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-main m-0">{cat.name}</h4>
                        <span className="text-xs text-muted">
                          {cat.subcategories?.length || 0} subcategories • {prodCount} products
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-icon"
                          title="Edit Category"
                          onClick={() => handleOpenCategoryModal(cat)}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Category"
                          style={{ color: '#f87171' }}
                          onClick={() => setDeleteTarget({ type: 'category', item: cat })}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Subcategories & Product Preview */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedCategory ? (
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-subtle mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-heading text-main">
                      {selectedCategory.name}
                    </h2>
                    <span className="badge badge-gold">
                      {getCategoryProductCount(selectedCategory.id)} Total Items
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {selectedCategory.description || 'No description entered.'}
                  </p>
                </div>

                {isAdmin && (
                  <Button
                    variant="wine"
                    size="sm"
                    icon="plus"
                    onClick={() => handleOpenSubcategoryModal()}
                  >
                    Add Subcategory
                  </Button>
                )}
              </div>

              {/* Subcategories Breakdown */}
              <h4 className="text-sm font-semibold text-secondary mb-3">
                Subcategories in {selectedCategory.name}
              </h4>

              {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) ? (
                <div className="text-center py-8 bg-surface-1 rounded-md">
                  <p className="text-muted text-sm mb-2">No subcategories defined for this department yet.</p>
                  {isAdmin && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenSubcategoryModal()}
                    >
                      Create First Subcategory
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {selectedCategory.subcategories.map((sub) => {
                    const subCount = getSubcategoryProductCount(sub.id);
                    return (
                      <div
                        key={sub.id}
                        className="p-4 rounded-md flex flex-col justify-between"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon name="layers" size={16} className="text-gold" />
                              <span className="font-bold text-main text-sm">{sub.name}</span>
                            </div>
                            <p className="text-xs text-muted mt-1 mb-2">
                              {sub.description || 'General departmental classification'}
                            </p>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                className="btn-icon"
                                title="Edit Subcategory"
                                onClick={() => handleOpenSubcategoryModal(sub)}
                              >
                                <Icon name="edit" size={13} />
                              </button>
                              <button
                                className="btn-icon"
                                title="Delete Subcategory"
                                style={{ color: '#f87171' }}
                                onClick={() => setDeleteTarget({ type: 'subcategory', item: sub })}
                              >
                                <Icon name="trash" size={13} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-subtle mt-2 text-xs">
                          <span className="text-muted">Associated Products:</span>
                          <span className="font-bold text-gold">{subCount} items</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-muted text-center py-12">Select a category on the left to inspect its subcategories.</p>
            </Card>
          )}
        </div>
      </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCategory}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
          <Input
            label="Category Name"
            placeholder="e.g. Electronics, Furniture..."
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
            autoFocus
          />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe what belongs in this category..."
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={subcategoryModalOpen}
        onClose={() => setSubcategoryModalOpen(false)}
        title={editingSubcategory ? 'Edit Subcategory' : `New Subcategory in ${selectedCategory?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSubcategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveSubcategory}>
              {editingSubcategory ? 'Save Changes' : 'Create Subcategory'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSubcategory} className="flex flex-col gap-4">
          <Input
            label="Subcategory Name"
            placeholder="e.g. Monitors, Keyboards, Cables..."
            value={subcategoryForm.name}
            onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
            required
            autoFocus
          />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe subcategory specifications..."
              value={subcategoryForm.description}
              onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title={`Delete ${deleteTarget.type === 'category' ? 'Category' : 'Subcategory'}`}
          message={`Are you sure you want to delete "${deleteTarget.item.name}"? Products assigned to this ${deleteTarget.type} may be affected.`}
          confirmText="Yes, Delete"
          variant="danger"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
