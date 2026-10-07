import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../../components/icons/Icons';

export const SettingsPage = () => {
  const { showSuccess } = useToast();

  const [settings, setSettings] = useState({
    orgName: 'Velvet Global Enterprise IMS',
    currency: 'INR (₹)',
    defaultLowStockThreshold: '10',
    expiryAlertDays: '30',
    orderPrefix: 'ORD-',
    returnWindowDays: '14',
    autoRestockMovements: true,
    emailAlertsEnabled: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSuccess('System settings successfully updated and saved');
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            System & <span className="text-gold">Operational Parameters</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Configure global warehouse thresholds, currency denominations, and backend database telemetry.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Organization & General */}
        <Card title="Organization & Regional Format" subtitle="Display branding and regional formatting" icon="sliders">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={settings.orgName}
              onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
            />
            <Select
              label="Default Currency Display"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={[
                { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' },
                { value: 'USD ($)', label: 'USD ($) - US Dollar' },
                { value: 'EUR (€)', label: 'EUR (€) - Euro' },
                { value: 'GBP (£)', label: 'GBP (£) - British Pound' },
              ]}
            />
            <Input
              label="Order Number Prefix"
              value={settings.orderPrefix}
              onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
            />
            <Input
              label="Return Window Period (Days)"
              type="number"
              value={settings.returnWindowDays}
              onChange={(e) => setSettings({ ...settings, returnWindowDays: e.target.value })}
            />
          </div>
        </Card>

        {/* Stock Safety & Alert Parameters */}
        <Card title="Inventory Thresholds & Early Warnings" subtitle="Automated status evaluation rules" icon="alert-circle">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Low Stock Threshold (Units)"
              type="number"
              value={settings.defaultLowStockThreshold}
              onChange={(e) => setSettings({ ...settings, defaultLowStockThreshold: e.target.value })}
            />
            <Input
              label="Expiry Alert Horizon (Days prior)"
              type="number"
              value={settings.expiryAlertDays}
              onChange={(e) => setSettings({ ...settings, expiryAlertDays: e.target.value })}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-subtle flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoRestockMovements}
                onChange={(e) => setSettings({ ...settings, autoRestockMovements: e.target.checked })}
              />
              <span>Automatically log Return restock movements when an RMA is COMPLETED</span>
            </label>
            <label className="flex items-center gap-3 text-sm text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
              />
              <span>Trigger high-priority alert notifications on Out-of-Stock breaches</span>
            </label>
          </div>
        </Card>

        {/* Backend & Database Telemetry */}
        <Card title="System Environment & Database Telemetry" subtitle="Active infrastructure diagnostics" icon="server">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-1 rounded-md border border-subtle">
              <span className="text-xs text-muted block">Backend Application</span>
              <span className="text-sm font-bold text-main">Spring Boot 3.2.0 (Java 17 OpenJDK)</span>
              <span className="text-xs text-sage block mt-1">● Service Active on port 8080</span>
            </div>

            <div className="p-3 bg-surface-1 rounded-md border border-subtle">
              <span className="text-xs text-muted block">Relational Database Engine</span>
              <span className="text-sm font-bold text-main">MySQL 8.0 (InnoDB)</span>
              <span className="text-xs text-gold block mt-1">Schema: inventory_management</span>
            </div>

            <div className="p-3 bg-surface-1 rounded-md border border-subtle">
              <span className="text-xs text-muted block">Authentication Protocol</span>
              <span className="text-sm font-bold text-main">Stateless JWT (HMAC-SHA512)</span>
              <span className="text-xs text-muted block mt-1">Token TTL: 24 Hours</span>
            </div>

            <div className="p-3 bg-surface-1 rounded-md border border-subtle">
              <span className="text-xs text-muted block">Frontend Architecture</span>
              <span className="text-sm font-bold text-main">React 18 + Redux Toolkit + Pure CSS</span>
              <span className="text-xs text-sage block mt-1">● Vite Dev Server</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="primary" icon="check" loading={saving}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
