import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, clearCurrentUser } from '../utils/storage';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const currentUser = user || getCurrentUser();

  const handleLogoutClick = () => {
    clearCurrentUser();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link
        to={currentUser?.role === 'admin' ? '/admin' : '/user'}
        className="navbar-brand"
        style={{ textDecoration: 'none' }}
      >
        <span className="brand-icon">🌤️</span>
        <span>SDC Weather Dashboard</span>
      </Link>

      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {currentUser.role === 'admin' ? (
            <span className="badge badge-admin">Administrator</span>
          ) : (
            <span className="badge badge-info">Student / User</span>
          )}
        </div>
      )}

      <div className="navbar-end">
        {currentUser ? (
          <>
            <span className="navbar-greeting">
              Welcome, <strong>{currentUser.name || currentUser.email}</strong>
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleLogoutClick}
              type="button"
              id="logout-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                logout
              </span>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
