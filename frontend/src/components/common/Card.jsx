import React from 'react';
import { Icon } from '../icons/Icons';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  elevated = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${elevated ? 'card-elevated' : ''} ${className}`} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p className="text-muted text-xs" style={{ marginTop: 2 }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  variant = 'terracotta',
  trend,
  className = '',
  ...props
}) => {
  const variantStyles = {
    gold: {
      bg: 'rgba(212, 175, 55, 0.15)',
      color: 'var(--color-gold)',
    },
    wine: {
      bg: 'rgba(122, 29, 63, 0.22)',
      color: 'var(--color-gold)',
    },
    terracotta: {
      bg: 'rgba(200, 90, 56, 0.18)',
      color: 'var(--color-terracotta)',
    },
    sage: {
      bg: 'rgba(122, 154, 131, 0.18)',
      color: 'var(--color-sage)',
    },
    coral: {
      bg: 'rgba(224, 109, 83, 0.2)',
      color: 'var(--color-coral)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.terracotta;
  const finalBg = iconBg || currentVariant.bg;
  const finalColor = iconColor || currentVariant.color;

  const renderTrend = () => {
    if (!trend) return null;

    if (typeof trend === 'object' && trend !== null) {
      const isUp = trend.direction === 'up' || trend.isPositive;
      const trendColor = isUp ? 'var(--color-sage)' : 'var(--color-coral)';
      const trendIcon = isUp ? 'trending-up' : 'trending-down';
      return (
        <span
          className="inline-flex items-center gap-1"
          style={{ color: trendColor, fontWeight: 600, fontSize: '0.75rem' }}
        >
          <Icon name={trendIcon} size={13} />
          {trend.text || trend.label || `${trend.value ?? ''}%`}
        </span>
      );
    }

    if (typeof trend === 'number' || typeof trend === 'string') {
      const isPositive = typeof trend === 'number' ? trend >= 0 : !String(trend).startsWith('-');
      return (
        <span
          style={{
            color: isPositive ? 'var(--color-sage)' : 'var(--color-coral)',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {typeof trend === 'number' && trend > 0 ? '+' : ''}
          {trend}%
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`card card-stat ${className}`} {...props}>
      <div>
        <div className="card-stat-title">{title}</div>
        <div className="card-stat-value">{value}</div>
        {(subtitle || trend) && (
          <div className="card-stat-sub flex items-center gap-2 mt-1">
            {renderTrend()}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
      <div className="card-stat-icon" style={{ backgroundColor: finalBg, color: finalColor }}>
        {icon && <Icon name={icon} size={24} />}
      </div>
    </div>
  );
};
