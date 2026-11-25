import React, { useState, useEffect, useRef } from 'react';
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

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Sync state if browser autofills inputs without triggering standard input events
  useEffect(() => {
    const syncAutofill = () => {
      if (nameRef.current?.value && !name) setName(nameRef.current.value);
      if (emailRef.current?.value && !email) setEmail(emailRef.current.value);
      if (passwordRef.current?.value && !password) setPassword(passwordRef.current.value);
      if (confirmRef.current?.value && !confirmPassword) setConfirmPassword(confirmRef.current.value);
    };

    // Run short timer checks for browser password managers and autofill
    const timer1 = setTimeout(syncAutofill, 100);
    const timer2 = setTimeout(syncAutofill, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [name, email, password, confirmPassword]);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Read values from React state, falling back to DOM inputs in case of silent browser autofill
    const form = e.currentTarget;
    const finalName = (name || nameRef.current?.value || form.elements?.['name']?.value || '').trim();
    const finalEmail = (email || emailRef.current?.value || form.elements?.['email']?.value || '').trim().toLowerCase();
    const finalPassword = password || passwordRef.current?.value || form.elements?.['password']?.value || '';
    const finalConfirm = confirmPassword || confirmRef.current?.value || form.elements?.['confirmPassword']?.value || '';

    // Update state to match DOM values
    setName(finalName);
    setEmail(finalEmail);
    setPassword(finalPassword);
    setConfirmPassword(finalConfirm);

    // 1. Check all required fields are present
    if (!finalName || !finalEmail || !finalPassword || !finalConfirm) {
      setError('All fields are required. Please fill out Full Name, Email, Password and Confirm Password.');
      return;
    }

    // 2. Validate Email format
    if (!validateEmail(finalEmail)) {
      setError('Please provide a valid email address (e.g. student@college.edu).');
      return;
    }

    // 3. Validate Password length
    if (finalPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    // 4. Validate Password and Confirm Password match
    if (finalPassword !== finalConfirm) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(finalName, finalEmail, finalPassword);

      if (!res.success) {
        setError(res.message || 'Signup failed. Please try a different email.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        // Redirect directly to User Dashboard
        navigate('/dashboard', { replace: true });
      }, 1000);
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
        <div className="ws-alert ws-alert-success" role="alert">
          <span className="ws-alert-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="ws-alert ws-alert-danger" role="alert">
          <span className="ws-alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ws-form" noValidate>
        <div className="ws-form-group">
          <label className="ws-form-label" htmlFor="signup-name">
            Full Name
          </label>
          <div className="ws-input-wrapper">
            <span className="ws-input-icon">👤</span>
            <input
              ref={nameRef}
              id="signup-name"
              name="name"
              type="text"
              className="ws-input"
              placeholder="e.g. Aarav Patel"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onInput={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              autoComplete="name"
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
              ref={emailRef}
              id="signup-email"
              name="email"
              type="email"
              className="ws-input"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              onInput={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              autoComplete="email"
              required
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
              ref={passwordRef}
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="ws-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              onInput={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="ws-pw-toggle"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              ref={confirmRef}
              id="signup-confirm"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="ws-input"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              onInput={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              autoComplete="new-password"
              required
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
