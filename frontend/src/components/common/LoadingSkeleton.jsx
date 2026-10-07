import React from 'react';

export const LoadingSkeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-xs)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};
