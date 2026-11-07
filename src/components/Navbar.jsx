import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';

export default function Navbar() {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { unit, toggleUnit } = useWeather();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="ws-navbar">
      <div className="ws-navbar-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="ws-brand">
          <div className="ws-brand-icon-wrapper">
            <span className="ws-brand-icon">🌤️</span>
          </div>
          <div className="ws-brand-text">
            <span className="ws-brand-title">WEATHER SENSE</span>
            <span className="ws-brand-sub">B.Tech SDC Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="ws-nav-links">
            <Link
              to="/dashboard"
              className={`ws-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/forecast"
              className={`ws-nav-link ${isActive('/forecast') ? 'active' : ''}`}
            >
              5-Day Forecast
            </Link>
            <Link
              to="/favorites"
              className={`ws-nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              Saved Cities
            </Link>
            <Link
              to="/profile"
              className={`ws-nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`ws-nav-link admin-pill ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin Panel
              </Link>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="ws-navbar-actions">
          {/* Unit Toggle Button */}
          <button
            type="button"
            className="ws-unit-toggle"
            onClick={toggleUnit}
            title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
          >
            <span className={unit === 'C' ? 'active-unit' : ''}>°C</span>
            <span className="ws-unit-divider">/</span>
            <span className={unit === 'F' ? 'active-unit' : ''}>°F</span>
          </button>

          {isAuthenticated ? (
            <div className="ws-user-menu">
              <div className="ws-user-meta">
                <span className="ws-user-name">{currentUser.name || currentUser.email}</span>
                <span className={`ws-badge ${isAdmin ? 'ws-badge-admin' : 'ws-badge-user'}`}>
                  {isAdmin ? 'Administrator' : 'Student / User'}
                </span>
              </div>
              <button
                type="button"
                className="ws-btn ws-btn-logout"
                onClick={handleLogout}
                title="Sign out of account"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="ws-auth-actions">
              <Link to="/login" className="ws-btn ws-btn-secondary">
                Login
              </Link>
              <Link to="/signup" className="ws-btn ws-btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="ws-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="ws-hamburger-bar"></span>
            <span className="ws-hamburger-bar"></span>
            <span className="ws-hamburger-bar"></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="ws-mobile-drawer">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`ws-mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/forecast"
                onClick={() => setMobileMenuOpen(false)}
                className={`ws-mobile-link ${isActive('/forecast') ? 'active' : ''}`}
              >
                📅 5-Day Forecast
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className={`ws-mobile-link ${isActive('/favorites') ? 'active' : ''}`}
              >
                ⭐ Favorite Cities
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`ws-mobile-link ${isActive('/profile') ? 'active' : ''}`}
              >
                👤 My Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`ws-mobile-link admin ${isActive('/admin') ? 'active' : ''}`}
                >
                  🛡️ Admin Panel
                </Link>
              )}
              <div className="ws-mobile-footer">
                <button
                  type="button"
                  className="ws-btn ws-btn-danger ws-btn-block"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="ws-mobile-auth">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="ws-btn ws-btn-secondary ws-btn-block"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="ws-btn ws-btn-primary ws-btn-block"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
