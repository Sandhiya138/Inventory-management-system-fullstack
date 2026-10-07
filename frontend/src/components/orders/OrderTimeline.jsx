import React from 'react';
import { Icon } from '../icons/Icons';

export const OrderTimeline = ({ status }) => {
  const steps = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const isCancelled = status === 'CANCELLED';
  const isReturned = status === 'RETURNED';

  const statusIndex = steps.findIndex((s) => s.key === status);
  // Default to step index or full if delivered
  const activeIndex = statusIndex !== -1 ? statusIndex : (isCancelled || isReturned ? 1 : 0);

  if (isCancelled) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-md"
        style={{
          background: 'rgba(186, 45, 74, 0.15)',
          border: '1px solid rgba(186, 45, 74, 0.4)',
          color: '#f06a88',
        }}
      >
        <Icon name="alert-circle" size={20} />
        <div>
          <span className="font-bold text-sm block">Order Cancelled</span>
          <span className="text-xs text-muted">This order was cancelled and inventory was replenished.</span>
        </div>
      </div>
    );
  }

  if (isReturned) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-md"
        style={{
          background: 'rgba(224, 109, 83, 0.15)',
          border: '1px solid rgba(224, 109, 83, 0.4)',
          color: 'var(--color-coral)',
        }}
      >
        <Icon name="returns" size={20} />
        <div>
          <span className="font-bold text-sm block">Order Returned</span>
          <span className="text-xs text-muted">Return request was processed and stock returned.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ padding: '16px 0' }}>
      <div
        className="flex items-center justify-between"
        style={{ position: 'relative' }}
      >
        {/* Connecting Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 20,
            right: 20,
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(activeIndex / (steps.length - 1)) * 100}%`,
              background: 'var(--gradient-gold)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isPassed = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center"
              style={{ zIndex: 2, position: 'relative' }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isPassed ? 'var(--color-plum)' : 'var(--bg-surface-1)',
                  border: `2px solid ${
                    isCurrent
                      ? 'var(--color-gold)'
                      : isPassed
                      ? 'var(--color-terracotta)'
                      : 'rgba(255, 255, 255, 0.15)'
                  }`,
                  color: isPassed ? 'var(--color-gold)' : 'var(--text-muted)',
                  boxShadow: isCurrent ? 'var(--shadow-glow-gold)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isPassed && idx < activeIndex ? (
                  <Icon name="check" size={14} />
                ) : (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? 'var(--color-gold)'
                    : isPassed
                    ? 'var(--text-main)'
                    : 'var(--text-muted)',
                  marginTop: 6,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
