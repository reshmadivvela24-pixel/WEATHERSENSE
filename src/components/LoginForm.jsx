import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginForm({ initialRole = 'user' }) {
  const [role, setRole] = useState(initialRole); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    // Auto fill admin credentials for convenience during college review
    if (newRole === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(cleanEmail, password, role);

      if (!res.success) {
        setError(res.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login redirection
      if (res.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="ws-auth-card ws-glass">
      {/* Role Selection Tabs */}
      <div className="ws-auth-tabs">
        <button
          type="button"
          className={`ws-auth-tab ${role === 'user' ? 'active' : ''}`}
          onClick={() => handleRoleChange('user')}
        >
          <span className="ws-tab-icon">👤</span>
          <span>User Portal</span>
        </button>
        <button
          type="button"
          className={`ws-auth-tab ${role === 'admin' ? 'active' : ''}`}
          onClick={() => handleRoleChange('admin')}
        >
          <span className="ws-tab-icon">🛡️</span>
          <span>Admin Portal</span>
        </button>
      </div>

      <div className="ws-auth-header">
        <h2 className="ws-auth-title">
          {role === 'admin' ? 'Administrator Login' : 'Student & User Login'}
        </h2>
        <p className="ws-auth-subtitle">
          {role === 'admin'
            ? 'Manage users, view API metrics, and system analytics'
            : 'Access real-time weather forecasts and saved locations'}
        </p>
      </div>

      {/* Reviewer Quick Hint for Admin Credentials */}
      {role === 'admin' && (
        <div className="ws-admin-hint">
          <strong>Reviewer Demo Credentials:</strong>
          <div className="ws-hint-row">Email: <code>admin@gmail.com</code></div>
          <div className="ws-hint-row">Password: <code>admin123</code></div>
        </div>
      )}

      {/* Error Message Alert */}
      {error && (
        <div className="ws-alert ws-alert-danger">
          <span className="ws-alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ws-form">
        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="login-email">
            Email Address
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">✉️</span>
            <input
              id="login-email"
              type="email"
              className="ws-input"
              placeholder={role === 'admin' ? 'admin@gmail.com' : 'student@college.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="login-password">
            Password
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">🔒</span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="ws-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ws-pw-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="ws-btn ws-btn-primary ws-btn-block ws-mt-md"
          disabled={loading}
        >
          {loading ? 'Verifying Credentials...' : `Sign In as ${role === 'admin' ? 'Admin' : 'User'}`}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="ws-auth-footer">
        {role === 'user' ? (
          <p>
            Don't have an account yet?{' '}
            <Link to="/signup" className="ws-link">
              Create an Account
            </Link>
          </p>
        ) : (
          <p>
            Need user access?{' '}
            <button
              type="button"
              className="ws-link-btn"
              onClick={() => handleRoleChange('user')}
            >
              Switch to Student Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
