import React, { useState, useEffect } from 'react';
import { Card, StatCard } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RoleBadge } from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { formatCurrency } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '+1-555-0301',
    password: '',
    confirmPassword: '',
  });

  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orderService.getOrders().then((data) => setOrders(data || [])).catch(() => {});
  }, []);

  const totalSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: user?.role,
        status: 'ACTIVE',
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await userService.updateUser(user.id, payload);
      showSuccess('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-main">
          Viewer <span className="text-gold">Profile & Preferences</span>
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage your account credentials, contact phone, and requisition statistics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Requisitions"
          value={orders.length}
          icon="shopping-bag"
          variant="wine"
          subtitle="Orders placed"
        />
        <StatCard
          title="Active in Pipeline"
          value={activeOrders.length}
          icon="truck"
          variant="gold"
          subtitle="Processing / Dispatch"
        />
        <StatCard
          title="Requisition Valuation"
          value={formatCurrency(totalSpend)}
          icon="currency"
          variant="sage"
          subtitle="Historical spend"
        />
      </div>

      {/* Main Profile Form Card */}
      <Card title="Account Credentials & Information" subtitle="Your portal access profile" icon="user">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-4 border-b border-subtle">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--gradient-burgundy)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                border: '2px solid var(--color-gold)',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-main m-0">{user?.fullName || 'User'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user?.role || 'VIEWER'} />
                <span className="text-xs text-muted">ID: #{user?.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled
            />
          </div>

          <Input
            label="Contact Telephone"
            placeholder="+1-555-0100"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="pt-2 border-t border-subtle">
            <h4 className="text-sm font-semibold text-secondary mb-3">Security & Password Update</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="New Password (optional)"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              icon="check"
              loading={saving}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
