import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setMobileSidebarOpen } from '../redux/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { Icon } from '../components/icons/Icons';
import { RoleBadge } from '../components/common/Badge';

export const Sidebar = () => {
  const { user, role, logout, isAdmin, isStaff, isViewer } = useAuth();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector((state) => state.ui);
  const unreadNotifications = useSelector((state) => state.notifications.unreadCount);
  const cartCount = useSelector((state) => state.cart.totalCount);
  const dispatch = useDispatch();

  const closeMobile = () => {
    dispatch(setMobileSidebarOpen(false));
  };

  // Role-based Nav Items
  const adminNav = [
    { section: 'Overview' },
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { section: 'Inventory & Catalog' },
    { to: '/inventory', icon: 'inventory', label: 'Inventory' },
    { to: '/categories', icon: 'categories', label: 'Categories' },
    { to: '/suppliers', icon: 'suppliers', label: 'Suppliers' },
    { to: '/stock-movements', icon: 'stock-movement', label: 'Stock Movements' },
    { section: 'Operations' },
    { to: '/orders', icon: 'orders', label: 'Orders' },
    { to: '/returns', icon: 'returns', label: 'Returns' },
    { to: '/reports', icon: 'reports', label: 'Reports' },
    { section: 'System & Comms' },
    { to: '/admin/users', icon: 'users', label: 'Users' },
    { to: '/messages', icon: 'messages', label: 'Messages' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications', badge: unreadNotifications },
    { to: '/admin/announcements', icon: 'announcements', label: 'Announcements' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  const staffNav = [
    { section: 'Warehouse' },
    { to: '/staff/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/inventory', icon: 'inventory', label: 'Inventory' },
    { to: '/staff/stock-entry', icon: 'plus', label: 'Stock Entry' },
    { to: '/stock-movements', icon: 'stock-movement', label: 'Stock History' },
    { section: 'Fulfillment' },
    { to: '/orders', icon: 'orders', label: 'Orders' },
    { to: '/returns', icon: 'returns', label: 'Returns' },
    { to: '/reports', icon: 'reports', label: 'Reports' },
    { section: 'Communications' },
    { to: '/messages', icon: 'messages', label: 'Messages' },
    { to: '/notifications', icon: 'notifications', label: 'Alerts & Notices', badge: unreadNotifications },
  ];

  const viewerNav = [
    { section: 'Marketplace' },
    { to: '/viewer/home', icon: 'home', label: 'Home' },
    { to: '/viewer/products', icon: 'inventory', label: 'Browse Products' },
    { to: '/viewer/categories', icon: 'categories', label: 'Categories' },
    { to: '/viewer/cart', icon: 'cart', label: 'My Cart', badge: cartCount },
    { section: 'My Activity' },
    { to: '/viewer/orders', icon: 'orders', label: 'My Orders' },
    { to: '/viewer/track-order', icon: 'truck', label: 'Track Order' },
    { to: '/returns', icon: 'returns', label: 'Returns' },
    { section: 'Support' },
    { to: '/messages', icon: 'messages', label: 'Messages' },
    { to: '/notifications', icon: 'notifications', label: 'Notifications', badge: unreadNotifications },
    { to: '/viewer/profile', icon: 'users', label: 'Profile' },
  ];

  const currentNav = isAdmin ? adminNav : isStaff ? staffNav : viewerNav;

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="drawer-overlay"
          style={{ zIndex: 95 }}
          onClick={closeMobile}
        />
      )}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileSidebarOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Header */}
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo" onClick={closeMobile}>
            <div className="sidebar-logo-icon">V</div>
            {!sidebarCollapsed && (
              <span className="sidebar-logo-text">VelvetStock</span>
            )}
          </NavLink>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {currentNav.map((item, idx) => {
            if (item.section) {
              if (sidebarCollapsed) return null;
              return (
                <div key={idx} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
                onClick={closeMobile}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="sidebar-item-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge > 0 && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with User info */}
        <div className="sidebar-footer">
          <div className="user-profile-mini">
            <div className="user-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="user-info-text">
                <span className="user-name">{user?.fullName || 'User'}</span>
                <span className="user-role-badge">{role}</span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="btn-icon btn-ghost text-muted hover:text-coral"
            title="Log out"
            style={{ cursor: 'pointer' }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};
