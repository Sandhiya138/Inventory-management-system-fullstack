import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/formatters';
import { Icon } from '../../components/icons/Icons';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { isViewer } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('notifications'); // 'notifications' | 'announcements'
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'ORDERS' | 'STOCK' | 'SYSTEM'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifRes, annRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getAnnouncements(),
      ]);
      setNotifications(Array.isArray(notifRes) ? notifRes : []);
      setAnnouncements(Array.isArray(annRes) ? annRes : []);
    } catch (err) {
      const msg = err.message || 'Unable to load notifications from backend server.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      showSuccess('Marked as read');
    } catch (err) {
      showError(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationCategory = (type) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_STATUS_CHANGED':
      case 'RETURN_REQUEST':
        return 'ORDERS';
      case 'LOW_STOCK':
      case 'CRITICAL_STOCK':
      case 'OUT_OF_STOCK':
      case 'EXPIRING_PRODUCT':
        return 'STOCK';
      default:
        return 'SYSTEM';
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter === 'UNREAD') return !n.isRead;
      if (categoryFilter === 'ORDERS') return getNotificationCategory(n.type) === 'ORDERS';
      if (categoryFilter === 'STOCK') return getNotificationCategory(n.type) === 'STOCK';
      if (categoryFilter === 'SYSTEM') return getNotificationCategory(n.type) === 'SYSTEM';
      return true;
    });
  }, [notifications, categoryFilter]);

  const getNotificationStyling = (type) => {
    switch (type) {
      case 'LOW_STOCK':
      case 'CRITICAL_STOCK':
      case 'OUT_OF_STOCK':
        return {
          icon: 'alert-triangle',
          bg: 'rgba(212, 175, 55, 0.15)',
          color: 'var(--color-gold)',
          border: 'var(--color-gold)',
          badgeText: 'Inventory Alert',
          badgeClass: 'badge-warning',
        };
      case 'NEW_ORDER':
      case 'ORDER_STATUS_CHANGED':
      case 'RETURN_REQUEST':
        return {
          icon: 'truck',
          bg: 'rgba(200, 90, 56, 0.15)',
          color: 'var(--color-terracotta)',
          border: 'var(--color-terracotta)',
          badgeText: 'Fulfillment & Order',
          badgeClass: 'badge-info',
        };
      case 'ADMIN_ANNOUNCEMENT':
        return {
          icon: 'shield',
          bg: 'rgba(122, 154, 131, 0.15)',
          color: 'var(--color-sage)',
          border: 'var(--color-sage)',
          badgeText: 'Announcement',
          badgeClass: 'badge-success',
        };
      default:
        return {
          icon: 'bell',
          bg: 'rgba(94, 25, 51, 0.15)',
          color: 'var(--color-wine)',
          border: 'var(--color-wine)',
          badgeText: 'General Notification',
          badgeClass: 'badge-default',
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-main">
            Alerts & <span className="text-gold">Activity Feed</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-time updates on orders, warehouse inventory alerts, and system bulletins.
          </p>
        </div>

        {activeTab === 'notifications' && unreadCount > 0 && (
          <Button
            variant="outline"
            icon="check"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Main Tabs (Alerts vs Announcements) */}
      <div className="flex items-center gap-3 border-b border-subtle pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'notifications'
              ? 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)'
              : 'var(--bg-surface-0)',
            color: activeTab === 'notifications' ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'notifications' ? 'transparent' : 'var(--border-subtle)'}`,
            fontWeight: activeTab === 'notifications' ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Icon name="bell" size={16} />
          <span>Direct Alerts</span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'notifications' ? 'rgba(255, 255, 255, 0.28)' : 'var(--color-coral)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'announcements'
              ? 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)'
              : 'var(--bg-surface-0)',
            color: activeTab === 'announcements' ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'announcements' ? 'transparent' : 'var(--border-subtle)'}`,
            fontWeight: activeTab === 'announcements' ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Icon name="activity" size={16} />
          <span>Broadcast Bulletins</span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'announcements' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(212, 175, 55, 0.15)',
              color: activeTab === 'announcements' ? '#ffffff' : 'var(--color-gold)',
              fontWeight: 700,
            }}
          >
            {announcements.length}
          </span>
        </button>
      </div>

      {error && (
        <ErrorState
          title="Unable to load notifications"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Tab 1: Direct Notifications */}
      {activeTab === 'notifications' && (
        <div className="flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'ALL', label: 'All Alerts', count: notifications.length },
              { id: 'UNREAD', label: 'Unread', count: unreadCount },
              {
                id: 'ORDERS',
                label: 'Orders & Dispatches',
                count: notifications.filter((n) => getNotificationCategory(n.type) === 'ORDERS').length,
              },
              {
                id: 'STOCK',
                label: 'Stock Alerts',
                count: notifications.filter((n) => getNotificationCategory(n.type) === 'STOCK').length,
              },
              {
                id: 'SYSTEM',
                label: 'System Notices',
                count: notifications.filter((n) => getNotificationCategory(n.type) === 'SYSTEM').length,
              },
            ].map((pill) => {
              const active = categoryFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategoryFilter(pill.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? 'var(--color-gold)' : 'var(--bg-surface-0)',
                    color: active ? '#1a0b24' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pill.label} ({pill.count})
                </button>
              );
            })}
          </div>

          {/* Cards List */}
          {loading ? (
            <div className="flex flex-col gap-3">
              <LoadingSkeleton variant="card" height={90} />
              <LoadingSkeleton variant="card" height={90} />
              <LoadingSkeleton variant="card" height={90} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <EmptyState
                title="No Notifications in this Category"
                message={
                  categoryFilter === 'UNREAD'
                    ? "You're all caught up! No unread notifications."
                    : 'No alerts match your current filter selection.'
                }
                icon="bell"
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredNotifications.map((n) => {
                const style = getNotificationStyling(n.type);
                return (
                  <div
                    key={n.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${n.isRead ? 'var(--border-subtle)' : 'var(--border-card)'}`,
                      borderLeft: n.isRead ? '1px solid var(--border-subtle)' : `4px solid ${style.border}`,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: n.isRead ? 'none' : 'var(--shadow-sm)',
                    }}
                  >
                    <div className="flex items-start gap-4" style={{ flex: 1 }}>
                      {/* Icon Circle */}
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          background: style.bg,
                          color: style.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <Icon name={style.icon} size={20} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: n.isRead ? 600 : 700,
                              color: 'var(--text-main)',
                            }}
                          >
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: 'var(--color-coral)',
                                display: 'inline-block',
                              }}
                              title="Unread"
                            />
                          )}
                          <span className={`badge ${style.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                            {style.badgeText}
                          </span>
                        </div>

                        <p
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            margin: '4px 0 8px 0',
                            lineHeight: 1.5,
                            maxWidth: '750px',
                          }}
                        >
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>{formatDateTime(n.createdAt)}</span>
                          {n.referenceId && (
                            <span>• Ref ID: #{n.referenceId}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                      {n.referenceId && n.type?.includes('ORDER') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="eye"
                          onClick={() => {
                            if (isViewer) {
                              navigate('/viewer/orders');
                            } else {
                              navigate('/orders');
                            }
                          }}
                        >
                          View
                        </Button>
                      )}
                      {!n.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon="check"
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Broadcast Bulletins */}
      {activeTab === 'announcements' && (
        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <Card>
              <EmptyState
                title="No Broadcast Bulletins"
                message="There are no active company announcements at this time."
                icon="bell"
              />
            </Card>
          ) : (
            announcements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-4">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-bold text-main m-0">{a.title}</h3>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.65rem',
                          background:
                            a.priority === 'URGENT'
                              ? 'rgba(186, 45, 74, 0.25)'
                              : a.priority === 'HIGH'
                              ? 'rgba(224, 109, 83, 0.2)'
                              : 'rgba(212, 175, 55, 0.18)',
                          color:
                            a.priority === 'URGENT'
                              ? '#f87171'
                              : a.priority === 'HIGH'
                              ? 'var(--color-coral)'
                              : 'var(--color-gold)',
                          fontWeight: 700,
                        }}
                      >
                        {a.priority} PRIORITY
                      </span>
                      {a.targetAudience && a.targetAudience !== 'ALL' && (
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {a.targetAudience} ONLY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary m-0 leading-relaxed whitespace-pre-wrap">
                      {a.message}
                    </p>
                    <span className="text-xs text-muted block mt-3">
                      Published {formatDateTime(a.createdAt)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
