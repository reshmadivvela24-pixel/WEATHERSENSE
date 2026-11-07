import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError('All fields are required. Please fill out the entire form.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please provide a valid email address (e.g. name@college.edu).');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(cleanName, cleanEmail, password);

      if (!res.success) {
        setError(res.message || 'Signup failed. Please try a different email.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting you to sign in...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setError('An error occurred during account creation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="ws-auth-card ws-glass">
      <div className="ws-auth-header">
        <h2 className="ws-auth-title">Create an Account</h2>
        <p className="ws-auth-subtitle">
          Join the Weather Sense student community for personal forecasts & alerts
        </p>
      </div>

      {/* Role Notice */}
      <div className="ws-role-notice">
        <span className="ws-notice-icon">ℹ️</span>
        <span>
          All new registrations are automatically assigned the <strong>Student / User</strong> role.
        </span>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="ws-alert ws-alert-success">
          <span className="ws-alert-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="ws-alert ws-alert-danger">
          <span className="ws-alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ws-form">
        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="signup-name">
            Full Name
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">👤</span>
            <input
              id="signup-name"
              type="text"
              className="ws-input"
              placeholder="e.g. Aarav Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="signup-email">
            Email Address
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">✉️</span>
            <input
              id="signup-email"
              type="email"
              className="ws-input"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="signup-password">
            Password
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">🔒</span>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="ws-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="signup-confirm">
            Confirm Password
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">🔒</span>
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              className="ws-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="ws-btn ws-btn-primary ws-btn-block ws-mt-md"
          disabled={loading || !!success}
        >
          {loading ? 'Registering Account...' : 'Sign Up as Student'}
        </button>
      </form>

      <div className="ws-auth-footer">
        <p>
          Already registered?{' '}
          <Link to="/login" className="ws-link">
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
}
