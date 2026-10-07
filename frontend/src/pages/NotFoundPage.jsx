import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (!isAuthenticated) navigate('/login');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'STAFF') navigate('/staff/dashboard');
    else navigate('/viewer/home');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        fontSize: '6rem',
        fontWeight: 900,
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-gold)',
        lineHeight: 1,
        marginBottom: 16,
        letterSpacing: '0.05em',
        textShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
      }}>
        404
      </div>

      <h2 style={{
        fontSize: '1.75rem',
        color: 'var(--text-main)',
        marginBottom: 12,
      }}>
        Page Not Found
      </h2>

      <p style={{
        maxWidth: 460,
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: 28,
      }}>
        The page you are looking for does not exist or has been relocated within the inventory system.
      </p>

      <Button variant="primary" icon="arrow-left" onClick={handleReturn}>
        Return Home
      </Button>
    </div>
  );
};
