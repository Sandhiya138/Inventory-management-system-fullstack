import React from 'react';

export const Badge = ({
  children,
  variant = 'gold', // healthy, low, critical, out, expiring, expired, gold, plum
  className = '',
  dot = false,
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
};

export const StockStatusBadge = ({ status }) => {
  switch (status) {
    case 'HEALTHY':
      return <Badge variant="healthy" dot>In Stock</Badge>;
    case 'LOW_STOCK':
      return <Badge variant="low" dot>Low Stock</Badge>;
    case 'CRITICAL':
      return <Badge variant="critical" dot>Critical</Badge>;
    case 'OUT_OF_STOCK':
      return <Badge variant="out" dot>Out of Stock</Badge>;
    case 'EXPIRING_SOON':
      return <Badge variant="expiring" dot>Expiring Soon</Badge>;
    case 'EXPIRED':
      return <Badge variant="expired" dot>Expired</Badge>;
    default:
      return <Badge variant="gold">{status || 'Unknown'}</Badge>;
  }
};

export const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="low">Pending</Badge>;
    case 'CONFIRMED':
      return <Badge variant="gold">Confirmed</Badge>;
    case 'PROCESSING':
      return <Badge variant="plum">Processing</Badge>;
    case 'PACKED':
      return <Badge variant="plum">Packed</Badge>;
    case 'SHIPPED':
      return <Badge variant="healthy">Shipped</Badge>;
    case 'DELIVERED':
      return <Badge variant="healthy">Delivered</Badge>;
    case 'CANCELLED':
      return <Badge variant="expired">Cancelled</Badge>;
    case 'RETURNED':
      return <Badge variant="critical">Returned</Badge>;
    default:
      return <Badge variant="gold">{status}</Badge>;
  }
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="gold">Admin</Badge>;
    case 'STAFF':
      return <Badge variant="healthy">Staff</Badge>;
    case 'VIEWER':
      return <Badge variant="plum">Viewer</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};
