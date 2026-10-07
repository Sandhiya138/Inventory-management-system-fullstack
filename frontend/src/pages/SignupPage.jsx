import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError, logout } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/uiSlice';
import { Icon } from '../components/icons/Icons';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../hooks/useToast';

export const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const { isAuthenticated, role, loading, error } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.ui?.theme) || 'dark';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'VIEWER',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email address';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const resultAction = await dispatch(
        registerUser({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          password: formData.password,
        })
      );

      if (registerUser.fulfilled.match(resultAction)) {
        dispatch(logout());
        showSuccess('Account created successfully! Please sign in with your credentials.');
        navigate('/login', { replace: true });
      } else if (registerUser.rejected.match(resultAction)) {
        showError(resultAction.payload || 'Registration failed');
      }
    } catch (err) {
      showError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: '32px 16px',
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
        maxWidth: '520px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px',
        zIndex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-wine) 0%, var(--color-terracotta) 100%)',
            boxShadow: '0 8px 24px rgba(122, 29, 63, 0.4)',
            marginBottom: '14px',
            color: 'var(--color-cream)',
          }}>
            <Icon name="package" size={28} />
          </div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}>
            Create Your <span style={{ color: 'var(--color-gold)' }}>Account</span>
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            margin: 0,
          }}>
            Register for access to stock catalog, requisition tracking, and orders
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="e.g. Priya Sharma"
            value={formData.fullName}
            onChange={handleChange}
            error={validationErrors.fullName}
            icon="user"
            required
            autoFocus
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. priya@company.com"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              icon="mail"
              required
            />

            <Input
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              icon="phone"
            />
          </div>

          {/* Account Role Selection */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: 6 }}>
              Account Type / Role
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'VIEWER' }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: formData.role === 'VIEWER' ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-surface-0)',
                  border: `1.5px solid ${formData.role === 'VIEWER' ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                  color: formData.role === 'VIEWER' ? 'var(--color-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="cart" size={18} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Customer / Viewer</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Browse & Requisition</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'STAFF' }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: formData.role === 'STAFF' ? 'rgba(200, 90, 56, 0.15)' : 'var(--bg-surface-0)',
                  border: `1.5px solid ${formData.role === 'STAFF' ? 'var(--color-terracotta)' : 'var(--border-subtle)'}`,
                  color: formData.role === 'STAFF' ? 'var(--color-terracotta)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon name="package" size={18} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Warehouse Staff</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stock Intake & Fulfillment</div>
                </div>
              </button>
            </div>
          </div>

          {/* Passwords */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password <span style={{ color: 'var(--color-coral)' }}>*</span>
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors.password}
              icon="lock"
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Confirm Password <span style={{ color: 'var(--color-coral)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={validationErrors.confirmPassword}
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
              marginTop: '8px',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.25)',
              fontWeight: 700,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account & Sign In'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
              style={{
                color: 'var(--color-gold)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
