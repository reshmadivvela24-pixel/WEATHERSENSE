import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useWeather } from '../context/WeatherContext';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, fetchWeather } = useWeather();
  const [newCity, setNewCity] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleAddFavorite = (e) => {
    e.preventDefault();
    const clean = newCity.trim();
    if (!clean) return;

    toggleFavorite(clean);
    setNewCity('');
    setMsg(`"${clean}" was added to your favorite cities!`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleOpenCity = (city) => {
    fetchWeather(city);
    navigate('/dashboard');
  };

  const handleRemove = (city, e) => {
    e.stopPropagation();
    toggleFavorite(city);
    setMsg(`"${city}" was removed from favorites.`);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          <div className="ws-admin-header ws-glass">
            <div>
              <div className="ws-badge ws-badge-warning">Saved Locations</div>
              <h2 className="ws-admin-title">Favorite Cities Collection</h2>
              <p className="ws-admin-desc">
                Quickly monitor weather across your customized list of pinned cities.
              </p>
            </div>

            {/* Add Favorite Form */}
            <form onSubmit={handleAddFavorite} className="ws-quick-search-form">
              <input
                type="text"
                placeholder="Enter city to pin (e.g. Paris)..."
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="ws-input-sm"
              />
              <button
                type="submit"
                className="ws-btn ws-btn-primary ws-btn-sm"
                disabled={!newCity.trim()}
              >
                + Pin City
              </button>
            </form>
          </div>

          {msg && (
            <div className="ws-alert ws-alert-success ws-mt-md">
              <span className="ws-alert-icon">✓</span>
              <span>{msg}</span>
            </div>
          )}

          {/* Favorites Grid */}
          <div className="ws-favorites-grid ws-mt-lg">
            {favorites.length === 0 ? (
              <div className="ws-card ws-glass ws-empty-favs">
                <span className="ws-empty-icon">⭐</span>
                <h3>No Favorite Cities Saved Yet</h3>
                <p className="ws-muted">
                  Use the search bar above or click the star button on any weather card to save your favorite cities.
                </p>
              </div>
            ) : (
              favorites.map((city) => (
                <div
                  key={city}
                  className="ws-favorite-card ws-glass"
                  onClick={() => handleOpenCity(city)}
                >
                  <div className="ws-fav-card-top">
                    <span className="ws-fav-star">★</span>
                    <button
                      type="button"
                      className="ws-fav-remove-btn"
                      onClick={(e) => handleRemove(city, e)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="ws-fav-city-title">{city}</h3>
                  <span className="ws-fav-meta">Click to view real-time telemetry</span>

                  <div className="ws-fav-card-action">
                    <span>View Weather →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
