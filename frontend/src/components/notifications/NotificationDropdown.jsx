import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
} from '../../redux/slices/notificationSlice';
import { notificationService } from '../../services/notificationService';
import { Icon } from '../icons/Icons';
import { formatDate } from '../../utils/formatters';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch(fetchNotifications());
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification.id));
    }
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="topbar-action-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && <span className="topbar-badge-dot" />}
      </button>

      {isOpen && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 360,
            padding: 0,
            zIndex: 1000,
            boxShadow: 'var(--shadow-lg), 0 0 25px rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            maxHeight: 460,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-card)',
              background: 'rgba(23, 13, 36, 0.6)',
            }}
          >
            <div className="flex items-center gap-2">
              <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
              {unreadCount > 0 && (
                <span className="badge badge-low">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="text-xs text-gold hover:underline"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <div className="text-center text-muted text-sm" style={{ padding: '28px 16px' }}>
                No notifications right now
              </div>
            ) : (
              notifications.slice(0, 7).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.06)',
                    cursor: 'pointer',
                    background: n.isRead ? 'transparent' : 'rgba(200, 90, 56, 0.08)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(60, 26, 75, 0.4)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = n.isRead
                      ? 'transparent'
                      : 'rgba(200, 90, 56, 0.08)')
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="font-semibold text-xs"
                      style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--color-gold)' }}
                    >
                      {n.title}
                    </span>
                    <span className="text-muted text-xs whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-muted text-xs"
                    style={{ marginTop: 4, lineHeight: 1.4 }}
                  >
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-card)',
              textAlign: 'center',
              background: 'rgba(15, 6, 23, 0.7)',
            }}
          >
            <button
              className="text-xs text-terracotta font-semibold hover:underline"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
