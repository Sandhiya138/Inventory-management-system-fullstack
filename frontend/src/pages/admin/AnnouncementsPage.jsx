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
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const AnnouncementsPage = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
      showError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      showError('Title and message are required');
      return;
    }

    setSubmitting(true);
    try {
      await notificationService.createAnnouncement(formData);
      showSuccess(`Announcement broadcasted successfully to ${
        formData.targetAudience === 'ALL'
          ? 'all portal users'
          : formData.targetAudience === 'STAFF'
          ? 'warehouse staff'
          : 'viewers & customers'
      }`);
      setModalOpen(false);
      setFormData({ title: '', message: '', priority: 'NORMAL', targetAudience: 'ALL' });
      loadAnnouncements();
    } catch (err) {
      showError(err.message || 'Failed to broadcast announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notificationService.deleteAnnouncement(deleteTarget.id);
      showSuccess(`Announcement "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      loadAnnouncements();
    } catch (err) {
      showError(err.message || 'Failed to delete announcement');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = (Array.isArray(announcements) ? announcements : []).filter((a) => {
    const matchPriority = !priorityFilter || a.priority === priorityFilter;
    const matchAudience = !audienceFilter || (a.targetAudience || 'ALL') === audienceFilter;
    return matchPriority && matchAudience;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="badge badge-danger">URGENT</span>;
      case 'HIGH':
        return <span className="badge badge-warning">HIGH</span>;
      case 'NORMAL':
        return <span className="badge badge-info">NORMAL</span>;
      case 'LOW':
      default:
        return <span className="badge badge-default">LOW</span>;
    }
  };

  const getAudienceBadge = (audience) => {
    switch (audience) {
      case 'STAFF':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(200, 90, 56, 0.15)',
              color: 'var(--color-terracotta)',
              border: '1px solid rgba(200, 90, 56, 0.3)',
            }}
          >
            <Icon name="package" size={12} />
            Staff Only
          </span>
        );
      case 'VIEWER':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(122, 154, 131, 0.15)',
              color: 'var(--color-sage)',
              border: '1px solid rgba(122, 154, 131, 0.3)',
            }}
          >
            <Icon name="cart" size={12} />
            Viewers Only
          </span>
        );
      case 'ALL':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--color-gold)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <Icon name="users" size={12} />
            All Users
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            System <span className="text-gold">Announcements</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Broadcast operational notices, warehouse shifts, and customer notifications.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setModalOpen(true)}
          >
            New Announcement
          </Button>
        )}
      </div>

      {/* Filter Ribbon */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap" style={{ flex: 1 }}>
            <div style={{ width: '220px' }}>
              <Select
                placeholder="All Priority Levels"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'URGENT', label: 'Urgent' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'LOW', label: 'Low' },
                ]}
              />
            </div>
            <div style={{ width: '220px' }}>
              <Select
                placeholder="All Audiences"
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Audiences' },
                  { value: 'ALL', label: 'All Users' },
                  { value: 'STAFF', label: 'Staff Only' },
                  { value: 'VIEWER', label: 'Viewers Only' },
                ]}
              />
            </div>
            {(priorityFilter || audienceFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPriorityFilter('');
                  setAudienceFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
          <span className="text-xs text-muted">
            Total Broadcasts: <strong>{filtered.length}</strong>
          </span>
        </div>
      </Card>

      {/* Announcements Stream */}
      {error ? (
        <ErrorState
          title="Failed to Load Announcements"
          message={error}
          onRetry={loadAnnouncements}
        />
      ) : loading ? (
        <div className="flex flex-col gap-4">
          <LoadingSkeleton variant="card" height={110} />
          <LoadingSkeleton variant="card" height={110} />
          <LoadingSkeleton variant="card" height={110} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Announcements Found"
          message="No active bulletins found for the selected filter."
          icon="bell"
          action={
            isAdmin && (
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                Create Announcement
              </Button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-main m-0">{a.title}</h3>
                    {getPriorityBadge(a.priority)}
                    {getAudienceBadge(a.targetAudience || 'ALL')}
                  </div>
                  <p className="text-sm text-secondary m-0 leading-relaxed whitespace-pre-wrap">
                    {a.message}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                    <span>Published: {formatDateTime(a.createdAt)}</span>
                    {a.createdBy?.fullName && (
                      <span>• By {a.createdBy.fullName}</span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash"
                    style={{ color: '#f87171' }}
                    onClick={() => setDeleteTarget(a)}
                    title="Delete Announcement"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Broadcast System Announcement"
        subtitle="Configure audience visibility and broadcast to authorized users"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={submitting}>
              Publish Announcement
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Announcement Title"
            placeholder="e.g. Scheduled Warehouse Maintenance This Weekend"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'LOW', label: 'Low - Informational' },
                { value: 'NORMAL', label: 'Normal - Standard Update' },
                { value: 'HIGH', label: 'High - Important Notice' },
                { value: 'URGENT', label: 'Urgent - Immediate Attention' },
              ]}
              required
            />

            <Select
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              options={[
                { value: 'ALL', label: 'All Users (Staff & Viewers)' },
                { value: 'STAFF', label: 'Staff Only' },
                { value: 'VIEWER', label: 'Viewers Only' },
              ]}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Message Content
            </label>
            <textarea
              className="form-control"
              rows="5"
              placeholder="Write the full announcement text..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-input)',
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                resize: 'vertical',
              }}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Bulletin"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
