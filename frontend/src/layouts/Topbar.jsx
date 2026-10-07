import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleMobileSidebar, toggleSidebar, toggleTheme } from '../redux/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { Icon } from '../components/icons/Icons';
import { NotificationDropdown } from '../components/notifications/NotificationDropdown';
import { RoleBadge } from '../components/common/Badge';

const ROUTE_HEADERS = {
  '/admin/dashboard': { title: 'Executive Overview', subtitle: 'Central operational metrics & valuation' },
  '/staff/dashboard': { title: 'Warehouse Hub', subtitle: 'Real-time fulfillment & stock velocity' },
  '/viewer/home': { title: 'Portal Overview', subtitle: 'Catalog discoveries & requisition tracking' },
  '/inventory': { title: 'Inventory Management', subtitle: 'Item catalog, stock counts & threshold monitors' },
  '/categories': { title: 'Categories & Taxonomy', subtitle: 'Classification structure & product groupings' },
  '/suppliers': { title: 'Supplier Directory', subtitle: 'Vendor contacts, procurement terms & active accounts' },
  '/stock-movements': { title: 'Stock Movement Ledger', subtitle: 'Audit log of all physical stock movements' },
  '/staff/stock-entry': { title: 'Stock Intake & Entry', subtitle: 'Record incoming shipment or adjustments' },
  '/orders': { title: 'Orders & Requisitions', subtitle: 'Customer fulfillment & dispatch workflows' },
  '/returns': { title: 'Returns & Replacements', subtitle: 'Return authorizations & triage queue' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Comprehensive sales, valuation & stock reporting' },
  '/messages': { title: 'Secure Communications', subtitle: 'Role-based operational messaging' },
  '/notifications': { title: 'Alerts & System Notices', subtitle: 'Stock warnings, events & broadcast bulletins' },
  '/admin/users': { title: 'User Management', subtitle: 'System permissions, roles & accounts' },
  '/admin/announcements': { title: 'Announcements', subtitle: 'Company-wide notices & alerts' },
  '/admin/settings': { title: 'System Settings', subtitle: 'Platform configurations & preferences' },
  '/viewer/products': { title: 'Product Catalog', subtitle: 'Browse items available for requisition' },
  '/viewer/cart': { title: 'Requisition Cart', subtitle: 'Review selected items & checkout' },
  '/viewer/orders': { title: 'My Orders', subtitle: 'History and fulfillment status' },
  '/viewer/track-order': { title: 'Track Order', subtitle: 'Live shipment tracking' },
  '/viewer/profile': { title: 'My Profile', subtitle: 'Account preferences and contact details' },
};

export const Topbar = ({ title, subtitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role, isViewer } = useAuth();
  const cartCount = useSelector((state) => state.cart.totalCount);
  const theme = useSelector((state) => state.ui.theme) || 'dark';

  const matchedHeader = ROUTE_HEADERS[location.pathname] || 
    Object.entries(ROUTE_HEADERS).find(([path]) => location.pathname.startsWith(path))?.[1] ||
    { title: 'VelvetStock', subtitle: '' };

  const displayTitle = title || matchedHeader.title;
  const displaySubtitle = subtitle || matchedHeader.subtitle;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-action-btn mobile-nav-toggle"
          onClick={() => dispatch(toggleMobileSidebar())}
          title="Open menu"
        >
          <Icon name="menu" size={20} />
        </button>

        <div>
          <h2 className="topbar-title">{displayTitle}</h2>
          {displaySubtitle && <p className="topbar-subtitle">{displaySubtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Viewer Cart Icon */}
        {isViewer && (
          <NavLink
            to="/viewer/cart"
            className="topbar-action-btn"
            title="Shopping Cart"
          >
            <Icon name="cart" size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--color-terracotta)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '1px 6px',
                  boxShadow: '0 0 8px rgba(200, 90, 56, 0.6)',
                }}
              >
                {cartCount}
              </span>
            )}
          </NavLink>
        )}

        {/* Messaging shortcut */}
        <NavLink
          to="/messages"
          className="topbar-action-btn"
          title="Messages"
        >
          <Icon name="messages" size={18} />
        </NavLink>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Switcher (Dark / Light) */}
        <button
          type="button"
          className="topbar-action-btn"
          onClick={() => dispatch(toggleTheme())}
          title={theme === 'dark' ? 'Switch to Luxury Light Mode' : 'Switch to Velvet Dark Mode'}
          aria-label="Toggle color theme"
          style={{
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        {/* User preview */}
        <div className="flex items-center gap-2" style={{ marginLeft: 6 }}>
          <div className="user-avatar" style={{ width: 34, height: 34 }}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-col" style={{ display: 'none', minWidth: 80 }}>
            <span className="user-name text-xs font-semibold">{user?.fullName}</span>
            <RoleBadge role={role} />
          </div>
        </div>
      </div>
    </header>
  );
};
