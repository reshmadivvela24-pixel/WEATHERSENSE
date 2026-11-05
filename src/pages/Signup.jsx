import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../utils/storage';

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({
    type: 'info',
    message: 'Create a new student or faculty account.',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password;
    const cleanConfirm = formData.confirmPassword;

    // 1. Validation: check empty
    if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirm) {
      setStatus({
        type: 'error',
        message: 'Please fill in all registration fields.',
      });
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email format (e.g., student@college.edu).',
      });
      return;
    }

    // 3. Password length
    if (cleanPassword.length < 6) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // 4. Password confirmation match
    if (cleanPassword !== cleanConfirm) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match. Please verify your entries.',
      });
      return;
    }

    setLoading(true);

    // Call storage registration (always registers role 'user')
    const result = registerUser(cleanName, cleanEmail, cleanPassword);

    if (result.success) {
      setStatus({
        type: 'success',
        message: result.message + ' Redirecting to Login...',
      });
      setTimeout(() => {
        setLoading(false);
        navigate('/login');
      }, 1000);
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Register for campus live weather advisories and forecasts.
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                className="form-input"
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="form-input"
                id="email"
                name="email"
                type="email"
                placeholder="student@college.edu"
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
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="form-input"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up as User'}
            </button>
          </form>

          {/* Notice: Role assignment */}
          <div
            style={{
              marginTop: 'var(--space-md)',
              fontSize: '11px',
              textAlign: 'center',
              color: 'var(--outline)',
            }}
          >
            * Note: Public registration automatically assigns the student <strong>User</strong> role.
          </div>

          {/* Login Link */}
          <div className="auth-footer">
            <p>
              Already registered?{' '}
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-interactive)' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
