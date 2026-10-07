import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/uiSlice';
import { Icon } from '../components/icons/Icons';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../hooks/useToast';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();

  const { isAuthenticated, role, loading, error } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui?.theme) || 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'STAFF') navigate('/staff/dashboard', { replace: true });
      else if (role === 'VIEWER') navigate('/viewer/home', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      showError('Your session has expired. Please log in again.');
    }
  }, [dispatch, location.search]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 4) errors.password = 'Password must be at least 4 characters';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(resultAction)) {
        showSuccess(`Welcome back, ${resultAction.payload.fullName || 'User'}!`);
        const userRole = resultAction.payload.role;
        if (userRole === 'ADMIN') navigate('/admin/dashboard');
        else if (userRole === 'STAFF') navigate('/staff/dashboard');
        else navigate('/viewer/home');
      }
    } catch (err) {
      // Handled via redux state.error
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setValidationErrors({});
    dispatch(clearAuthError());
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Theme Switcher in top right corner */}
      <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 10 }}>
        <button
          type="button"
          className="topbar-action-btn"
          onClick={() => dispatch(toggleTheme())}
          title={theme === 'dark' ? 'Switch to Luxury Light Mode' : 'Switch to Velvet Dark Mode'}
          aria-label="Toggle theme"
          style={{ cursor: 'pointer' }}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </div>

      {/* Decorative ambient background glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(163, 44, 82, 0.18) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '15%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200, 90, 56, 0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px 36px',
        zIndex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)',
            boxShadow: '0 8px 24px rgba(122, 29, 63, 0.4)',
            marginBottom: '16px',
            color: 'var(--color-cream)',
          }}>
            <Icon name="package" size={32} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}>
            VELVET <span style={{ color: 'var(--color-gold)' }}>IMS</span>
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            margin: 0,
          }}>
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: 'rgba(186, 45, 74, 0.15)',
            border: '1px solid rgba(186, 45, 74, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
          }}>
            <Icon name="alert-circle" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. admin@inventory.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={validationErrors.email}
            icon="user"
            required
            autoFocus
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-gold)',
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.password}
              icon="lock"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            style={{
              marginTop: '10px',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)',
              fontWeight: 700,
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
            </span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-gold)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Quick Demo Logins Box */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <p style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '12px',
            fontWeight: 600,
          }}>
            Quick Fill Demo Accounts
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@inventory.com', 'admin123')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 6px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(94, 25, 51, 0.25)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: 'var(--color-cream)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)'}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-gold)' }}>Admin</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Full Access</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff@inventory.com', 'staff123')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 6px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(200, 90, 56, 0.2)',
                border: '1px solid rgba(200, 90, 56, 0.3)',
                color: 'var(--color-cream)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terracotta)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(200, 90, 56, 0.3)'}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-terracotta)' }}>Staff</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Warehouse</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('viewer@inventory.com', 'viewer123')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 6px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(122, 154, 131, 0.15)',
                border: '1px solid rgba(122, 154, 131, 0.3)',
                color: 'var(--color-cream)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-sage)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(122, 154, 131, 0.3)'}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-sage)' }}>Viewer</span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Orders & Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
