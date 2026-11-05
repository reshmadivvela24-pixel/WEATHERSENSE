import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticateUser, getCurrentUser, DEFAULT_ADMIN } from '../utils/storage';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [status, setStatus] = useState({
    type: 'info',
    message: 'Please enter your login credentials to continue.',
  });

  const [loading, setLoading] = useState(false);

  // If already logged in, automatically navigate to appropriate dashboard
  useEffect(() => {
    const existing = getCurrentUser();
    if (existing) {
      if (existing.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password;

    if (!cleanEmail || !cleanPassword) {
      setStatus({
        type: 'error',
        message: 'Please fill in both email address and password.',
      });
      return;
    }

    setLoading(true);

    const result = authenticateUser(cleanEmail, cleanPassword);

    if (result.success) {
      setStatus({
        type: 'success',
        message: result.message + ' Redirecting...',
      });

      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }

      setTimeout(() => {
        setLoading(false);
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user');
        }
      }, 600);
    } else {
      setLoading(false);
      setStatus({
        type: 'error',
        message: result.message,
      });
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <span role="img" aria-label="weather icon">
                🌤️
              </span>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your SDC Weather Dashboard.
            </p>
          </div>

          {/* Status Alert Box */}
          <div className="auth-status">
            <div
              className={`alert ${
                status.type === 'error'
                  ? 'alert-error'
                  : status.type === 'success'
                  ? 'alert-success'
                  : 'alert-info'
              }`}
            >
              <span className="material-symbols-outlined alert-icon">
                {status.type === 'error'
                  ? 'error'
                  : status.type === 'success'
                  ? 'check_circle'
                  : 'info'}
              </span>
              <span>{status.message}</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="form-input"
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-input"
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Box for College Review */}
          <div
            style={{
              marginTop: 'var(--space-md)',
              padding: '10px 12px',
              background: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--outline-variant)',
              fontSize: '12px',
              color: 'var(--on-surface-variant)',
            }}
          >
            <strong>College Review Demo Credentials:</strong>
            <div style={{ marginTop: '4px' }}>
              • <strong>Admin:</strong> {DEFAULT_ADMIN.email} | {DEFAULT_ADMIN.password}
            </div>
            <div>
              • <strong>User:</strong> Register a new account below or use your saved details
            </div>
          </div>

          {/* Signup Link */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary-interactive)' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
