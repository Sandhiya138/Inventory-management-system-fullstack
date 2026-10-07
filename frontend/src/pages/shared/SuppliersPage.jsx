import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/icons/Icons';

export const SuppliersPage = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
  });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [supRes, prodRes] = await Promise.all([
        productService.getSuppliers(),
        productService.getProducts(),
      ]);
      setSuppliers(Array.isArray(supRes) ? supRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
      showError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        status: supplier.status || 'ACTIVE',
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Supplier name is required');
      return;
    }
    try {
      if (editingSupplier) {
        await productService.updateSupplier(editingSupplier.id, formData);
        showSuccess(`Supplier "${formData.name}" updated successfully`);
      } else {
        await productService.createSupplier(formData);
        showSuccess(`Supplier "${formData.name}" registered successfully`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteSupplier(deleteTarget.id);
      showSuccess(`Supplier "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Failed to delete supplier');
    }
  };

  const filteredSuppliers = (Array.isArray(suppliers) ? suppliers : []).filter(
    (s) =>
      !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Vendor & <span className="text-gold">Supplier Directory</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Maintain authorized procurement channels, distributor points of contact, and facility addresses.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon="plus"
            onClick={() => handleOpenModal()}
          >
            Add New Supplier
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div style={{ maxWidth: '380px', width: '100%' }}>
            <Input
              placeholder="Search vendor by name, email, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="search"
            />
          </div>
          <span className="text-xs text-muted">
            Total Authorized Vendors: <strong>{suppliers.length}</strong>
          </span>
        </div>
      </Card>

      {/* Suppliers Grid / Cards */}
      {error ? (
        <ErrorState
          title="Failed to Load Suppliers"
          message={error}
          onRetry={loadData}
        />
      ) : loading ? (
        <div className="grid grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" height={220} />
          <LoadingSkeleton variant="card" height={220} />
          <LoadingSkeleton variant="card" height={220} />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No Suppliers Found"
          message="No vendors match your search criteria."
          icon="truck"
        />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const productCount = products.filter(
              (p) => (p.supplier?.id || p.supplierId) === supplier.id
            ).length;

            return (
              <div
                key={supplier.id}
                className="card p-5 flex flex-col justify-between"
                style={{
                  background: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-main m-0">{supplier.name}</h3>
                      <span className="text-xs text-gold font-medium block mt-1">
                        Contact: {supplier.contactPerson || 'N/A'}
                      </span>
                    </div>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.65rem',
                        background: supplier.status === 'ACTIVE' ? 'rgba(122, 154, 131, 0.2)' : 'rgba(186, 45, 74, 0.2)',
                        color: supplier.status === 'ACTIVE' ? 'var(--color-sage)' : '#f87171',
                      }}
                    >
                      {supplier.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-muted mb-4">
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Icon name="mail" size={13} className="text-gold" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Icon name="phone" size={13} className="text-gold" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-2">
                        <Icon name="map-pin" size={13} className="text-gold mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-subtle flex items-center justify-between">
                  <span className="text-xs text-muted font-medium">
                    <strong className="text-gold">{productCount}</strong> items supplied
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="edit"
                        title="Edit Supplier"
                        onClick={() => handleOpenModal(supplier)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="trash"
                        title="Delete Supplier"
                        style={{ color: '#f87171' }}
                        onClick={() => setDeleteTarget(supplier)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSupplier ? 'Edit Vendor Details' : 'Register New Vendor'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingSupplier ? 'Save Changes' : 'Register Vendor'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Vendor / Company Name"
            placeholder="e.g. Prime Logistics, ErgoComfort..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              placeholder="e.g. Dwight Schrute"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="vendor@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+1-555-0100"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse / Headquarters Address</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Physical street address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Supplier"
          message={`Are you sure you want to delete supplier "${deleteTarget.name}"? Products linked to this vendor may lose supplier referencing.`}
          confirmText="Yes, Delete"
          variant="danger"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
