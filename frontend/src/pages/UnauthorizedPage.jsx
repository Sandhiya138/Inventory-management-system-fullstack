import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Icon } from '../components/icons/Icons';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'STAFF') {
      navigate('/staff/dashboard');
    } else {
      navigate('/viewer/home');
    }
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
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: 'rgba(186, 45, 74, 0.2)',
        border: '2px solid rgba(186, 45, 74, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f87171',
        marginBottom: 24,
      }}>
        <Icon name="lock" size={40} />
      </div>

      <h1 style={{
        fontSize: '2rem',
        fontFamily: 'var(--font-heading)',
        color: 'var(--text-main)',
        marginBottom: 12,
      }}>
        Access Restricted
      </h1>

      <p style={{
        maxWidth: 480,
        color: 'var(--text-muted)',
        fontSize: '1rem',
        lineHeight: 1.6,
        marginBottom: 28,
      }}>
        You do not have the required permissions to access this page. Please return to your designated portal or contact your system administrator.
      </p>

      <Button variant="primary" icon="arrow-left" onClick={handleReturn}>
        Back to Safe Area
      </Button>
    </div>
  );
};
