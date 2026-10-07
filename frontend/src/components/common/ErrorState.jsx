import React from 'react';
import { Icon } from '../icons/Icons';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'Please make sure the backend server is running on port 8080.',
  onRetry,
}) => {
  return (
    <div
      className="card p-8 flex flex-col items-center justify-center text-center animate-fade"
      style={{
        margin: '2rem 0',
        borderColor: 'rgba(224, 109, 83, 0.4)',
        background: 'rgba(94, 25, 51, 0.15)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(224, 109, 83, 0.15)',
          color: 'var(--color-coral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon name="alert-triangle" size={28} />
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--color-cream)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--color-cream-muted)',
          maxWidth: 480,
          marginBottom: '1.5rem',
          lineHeight: 1.5,
          fontSize: '0.9rem',
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="primary" icon="refresh" onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
