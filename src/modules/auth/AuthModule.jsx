import React, { useState } from 'react';
import { loginUser, signupUser, ADMIN_CREDENTIALS } from '../../services/storage';

export default function AuthModule({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'
  const [userMode, setUserMode] = useState('login'); // 'login' or 'signup'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({
    type: 'info',
    message: 'Ready for User login. Enter your student/faculty account.',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });

    if (role === 'admin') {
      setUserMode('login');
      setStatus({
        type: 'info',
        message: 'Ready for Administrator login. Enter admin credentials.',
      });
    } else {
      setStatus({
        type: 'info',
        message: 'Ready for User login. Enter your credentials or click Sign Up.',
      });
    }
  };

  const handleUserModeSwitch = (mode) => {
    setUserMode(mode);
    setFormData((prev) => ({ ...prev, name: '', confirmPassword: '' }));
    if (mode === 'login') {
      setStatus({
        type: 'info',
        message: 'Ready for User login',
      });
    } else {
      setStatus({
        type: 'info',
        message: 'Fill details to register as a new student/user account.',
      });
    }
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

    // ── User Sign Up Flow ──
    if (selectedRole === 'user' && userMode === 'signup') {
      const cleanName = formData.name.trim();

      if (!cleanName) {
        setStatus({ type: 'error', message: 'Please enter your full name.' });
        return;
      }
      if (cleanPassword.length < 6) {
        setStatus({
          type: 'error',
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }
      if (cleanPassword !== formData.confirmPassword) {
        setStatus({
          type: 'error',
          message: 'Passwords do not match. Please verify and try again.',
        });
        return;
      }

      const result = signupUser(cleanName, cleanEmail, cleanPassword);
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message + ' Switching to login...',
        });
        setTimeout(() => {
          setUserMode('login');
          setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
          setStatus({
            type: 'success',
            message: 'Registration complete. Enter your password to log in.',
          });
        }, 900);
      } else {
        setStatus({ type: 'error', message: result.message });
      }
      return;
    }

    // ── Login Flow (User or Admin) ──
    const result = loginUser(cleanEmail, cleanPassword, selectedRole);

    if (result.success) {
      setStatus({
        type: 'success',
        message: 'Login successful! Redirecting...',
      });
      setTimeout(() => {
        onLoginSuccess(result.user);
      }, 600);
    } else {
      setStatus({ type: 'error', message: result.message });
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <span role="img" aria-label="weather icon">
              🌤️
            </span>
          </div>
          <h1 className="auth-title">SDC Weather App</h1>
          <p className="auth-subtitle">
            College Student Development Council Weather Dashboard.
            <br />
            Select your portal to continue.
          </p>
        </div>

        {/* Primary Role Selector: User Login vs Admin Login */}
        <div className="auth-role-tabs mb-sm">
          <div className="tab-bar tab-bar-roles" role="tablist" aria-label="Portal Selection">
            <button
              className={`tab-btn ${selectedRole === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('user')}
              type="button"
              role="tab"
              aria-selected={selectedRole === 'user'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                person
              </span>
              User Login
            </button>
            <button
              className={`tab-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSwitch('admin')}
              type="button"
              role="tab"
              aria-selected={selectedRole === 'admin'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                admin_panel_settings
              </span>
              Admin Login
            </button>
          </div>
        </div>

        {/* User Sub-Tabs: Login vs Sign Up (only in User mode) */}
        {selectedRole === 'user' && (
          <div className="auth-tabs mb-sm">
            <div className="tab-bar tab-bar-sub" role="tablist">
              <button
                className={`tab-btn ${userMode === 'login' ? 'active' : ''}`}
                onClick={() => handleUserModeSwitch('login')}
                type="button"
                role="tab"
                aria-selected={userMode === 'login'}
              >
                Login
              </button>
              <button
                className={`tab-btn ${userMode === 'signup' ? 'active' : ''}`}
                onClick={() => handleUserModeSwitch('signup')}
                type="button"
                role="tab"
                aria-selected={userMode === 'signup'}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

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
                : selectedRole === 'admin'
                ? 'admin_panel_settings'
                : 'info'}
            </span>
            <span>{status.message}</span>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name (Sign Up only) */}
          {selectedRole === 'user' && userMode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="input-name">
                Full Name
              </label>
              <input
                className="form-input"
                id="input-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-email">
              Email Address
            </label>
            <input
              className="form-input"
              id="input-email"
              name="email"
              type="email"
              placeholder={
                selectedRole === 'admin' ? 'admin@sdc.edu' : 'Enter your email'
              }
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="input-password">
              Password
            </label>
            <input
              className="form-input"
              id="input-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Confirm Password (Sign Up only) */}
          {selectedRole === 'user' && userMode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="input-confirm-password">
                Confirm Password
              </label>
              <input
                className="form-input"
                id="input-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button className="btn btn-primary btn-full" type="submit">
            {selectedRole === 'admin'
              ? 'Login as Admin'
              : userMode === 'signup'
              ? 'Register as User'
              : 'Login as User'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Accounts and active sessions are stored locally in your browser.
            <br />
            {selectedRole === 'admin' && (
              <span style={{ fontSize: '11px', color: 'var(--primary)' }}>
                Demo Admin Credentials available in README
              </span>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
