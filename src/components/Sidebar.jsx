import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';

export default function Sidebar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { favorites, fetchWeather } = useWeather();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickCityClick = (city) => {
    fetchWeather(city);
    navigate('/dashboard');
  };

  return (
    <aside className="ws-sidebar">
      <div className="ws-sidebar-section">
        <span className="ws-sidebar-heading">MAIN MENU</span>
        <nav className="ws-sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `ws-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="ws-sidebar-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/forecast"
            className={({ isActive }) => `ws-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="ws-sidebar-icon">📅</span>
            <span>5-Day Forecast</span>
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `ws-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="ws-sidebar-icon">⭐</span>
            <span>Favorite Cities</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `ws-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="ws-sidebar-icon">👤</span>
            <span>User Profile</span>
          </NavLink>
        </nav>
      </div>

      {isAdmin && (
        <div className="ws-sidebar-section">
          <span className="ws-sidebar-heading">ADMINISTRATION</span>
          <nav className="ws-sidebar-nav">
            <NavLink
              to="/admin"
              className={({ isActive }) => `ws-sidebar-link admin ${isActive ? 'active' : ''}`}
            >
              <span className="ws-sidebar-icon">🛡️</span>
              <span>Admin Management</span>
            </NavLink>
          </nav>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="ws-sidebar-section">
          <span className="ws-sidebar-heading">FAVORITE CITIES</span>
          <div className="ws-sidebar-favs">
            {favorites.slice(0, 5).map((city) => (
              <button
                key={city}
                type="button"
                className="ws-sidebar-fav-btn"
                onClick={() => handleQuickCityClick(city)}
              >
                <span className="ws-fav-pin">📍</span>
                <span className="ws-fav-name">{city}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ws-sidebar-footer">
        <div className="ws-sidebar-user">
          <div className="ws-user-avatar">
            {(currentUser?.name ? currentUser.name[0] : 'U').toUpperCase()}
          </div>
          <div className="ws-user-details">
            <span className="ws-user-title">{currentUser?.name || 'Student User'}</span>
            <span className="ws-user-role">
              {isAdmin ? 'System Admin' : 'B.Tech Student'}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="ws-sidebar-logout"
          onClick={handleLogout}
          title="Sign out"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
