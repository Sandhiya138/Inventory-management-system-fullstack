import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RoleBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'STAFF',
    status: 'ACTIVE',
  });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      showError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '', // leave empty if not changing
        phone: user.phone || '',
        role: user.role || 'STAFF',
        status: user.status || 'ACTIVE',
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF',
        status: 'ACTIVE',
      });
    }
    setModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showError('Name and email are required');
      return;
    }
    if (!editingUser && !formData.password) {
      showError('Password is required for new accounts');
      return;
    }

    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        showSuccess(`User "${formData.fullName}" updated successfully`);
      } else {
        await userService.createUser(formData);
        showSuccess(`User account for "${formData.fullName}" created`);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      showError(err.message || 'Failed to save user account');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      showError('You cannot delete your own active administrator account');
      return;
    }
    try {
      await userService.deleteUser(deleteTarget.id);
      showSuccess(`User "${deleteTarget.fullName}" deleted successfully`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    const matchesSearch =
      !searchTerm ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            User Accounts & <span className="text-gold">Access Controls</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Manage system administrators, warehouse staff, and viewer credentials.
          </p>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => handleOpenModal()}
        >
          Add New User
        </Button>
      </div>

      {/* Role Category Tabs & Search Ribbon */}
      <Card>
        <div className="flex flex-col gap-4">
          {/* Category Tabs: All, Admin, Staff, Viewer */}
          <div className="flex items-center gap-2 flex-wrap border-b border-subtle pb-3">
            {[
              { id: '', label: 'All Accounts', count: users.length, icon: 'users' },
              { id: 'ADMIN', label: 'Administrators', count: users.filter((u) => u.role === 'ADMIN').length, icon: 'shield' },
              { id: 'STAFF', label: 'Warehouse Staff', count: users.filter((u) => u.role === 'STAFF').length, icon: 'package' },
              { id: 'VIEWER', label: 'Viewers & Customers', count: users.filter((u) => u.role === 'VIEWER').length, icon: 'cart' },
            ].map((tab) => {
              const isActive = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoleFilter(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)' : 'var(--bg-surface-0)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'transparent' : 'var(--border-subtle)'}`,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(212, 175, 55, 0.15)',
                      color: isActive ? '#ffffff' : 'var(--color-gold)',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1 }}>
              <Input
                placeholder={`Search ${roleFilter ? roleFilter.toLowerCase() + ' ' : ''}users by name, email, or telephone...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="search"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card p={0}>
        {error ? (
          <div className="p-6">
            <ErrorState
              title="Failed to Load Users"
              message={error}
              onRetry={loadUsers}
            />
          </div>
        ) : loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" count={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users Found"
            message="No user accounts match your search filter."
            icon="user"
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: 'center' }}>Role</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex flex-col" style={{ gap: '2px' }}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-main">{u.fullName}</span>
                            {isCurrent && (
                              <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted font-mono">UID: #{u.id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col" style={{ gap: '2px' }}>
                          <span className="text-sm text-secondary" style={{ display: 'block' }}>{u.email}</span>
                          {u.phone && <span className="text-xs text-muted" style={{ display: 'block' }}>{u.phone}</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <RoleBadge role={u.role} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.65rem',
                            background: u.status === 'ACTIVE' ? 'rgba(122, 154, 131, 0.2)' : 'rgba(186, 45, 74, 0.2)',
                            color: u.status === 'ACTIVE' ? 'var(--color-sage)' : '#f87171',
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {formatDate(u.createdAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="edit"
                            title="Edit User"
                            onClick={() => handleOpenModal(u)}
                          />
                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon="trash"
                              title="Delete User"
                              style={{ color: '#f87171' }}
                              onClick={() => setDeleteTarget(u)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.fullName}` : 'Create New User Account'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUser}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            autoFocus
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="user@inventory.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={editingUser ? 'Password (leave blank to keep existing)' : 'Password'}
            type="password"
            placeholder="Enter secure password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'ADMIN', label: 'Admin (Full Access)' },
                { value: 'STAFF', label: 'Staff (Warehouse Operations)' },
                { value: 'VIEWER', label: 'Viewer (Requisitions)' },
              ]}
              required
            />

            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
              required
            />
          </div>

          <Input
            label="Phone Number (Optional)"
            placeholder="+1-555-0100"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete "${deleteTarget.fullName}" (${deleteTarget.email})? This user will immediately lose access.`}
          confirmText="Yes, Delete User"
          variant="danger"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
};
