import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import { useWeather } from '../context/WeatherContext';
import { getAnnouncements } from '../services/storageService';

export default function UserDashboard() {
  const [searchInput, setSearchInput] = useState('');
  const {
    currentCity,
    weatherData,
    unit,
    recentSearches,
    fetchWeather,
    fetchCurrentLocation,
    loading,
    error,
  } = useWeather();

  const [announcements] = useState(() => getAnnouncements());

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleRecentClick = (cityName) => {
    fetchWeather(cityName);
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          {/* Top Search & Location Bar */}
          <div className="ws-search-section ws-glass">
            <form onSubmit={handleSearchSubmit} className="ws-search-form">
              <div className="ws-search-input-wrap">
                <span className="ws-search-icon">🔍</span>
                <input
                  type="text"
                  className="ws-search-input"
                  placeholder="Search weather by city name (e.g. Mumbai, London, New York)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="ws-search-actions">
                <button
                  type="submit"
                  className="ws-btn ws-btn-primary"
                  disabled={loading || !searchInput.trim()}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>

                <button
                  type="button"
                  className="ws-btn ws-btn-secondary ws-btn-geo"
                  onClick={fetchCurrentLocation}
                  disabled={loading}
                  title="Detect live GPS coordinates"
                >
                  <span className="ws-geo-icon">📍</span>
                  <span>My Location</span>
                </button>
              </div>
            </form>

            {/* Recent Searches Row */}
            {recentSearches && recentSearches.length > 0 && (
              <div className="ws-recent-searches">
                <span className="ws-recent-label">Recent:</span>
                <div className="ws-recent-pills">
                  {recentSearches.slice(0, 6).map((item) => {
                    const cityName = typeof item === 'string' ? item : item.city;
                    return (
                      <button
                        key={cityName + Math.random()}
                        type="button"
                        className={`ws-recent-pill ${cityName.toLowerCase() === currentCity.toLowerCase() ? 'active' : ''}`}
                        onClick={() => handleRecentClick(cityName)}
                      >
                        {cityName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Campus Weather Advisory / Announcements */}
          {announcements && announcements.length > 0 && (
            <div className="ws-announcement-banner ws-glass">
              <span className="ws-ann-badge">Campus Weather Alert</span>
              <div className="ws-ann-content">
                <strong>{announcements[0].title}:</strong> {announcements[0].content}
              </div>
            </div>
          )}

          {/* Main Weather Card */}
          <div className="ws-weather-card-container">
            <WeatherCard />
          </div>

          {/* 5-Day Forecast Preview Section */}
          {weatherData && weatherData.daily && (
            <section className="ws-forecast-section">
              <div className="ws-section-header">
                <div>
                  <h3 className="ws-section-heading">5-Day Weather Forecast</h3>
                  <p className="ws-section-sub">Daily temperature trends for {currentCity}</p>
                </div>
              </div>

              <div className="ws-forecast-grid">
                {weatherData.daily.time.slice(0, 5).map((date, index) => {
                  const dayData = {
                    date,
                    weatherCode: weatherData.daily.weatherCode[index],
                    maxTemp: weatherData.daily.maxTemp[index],
                    minTemp: weatherData.daily.minTemp[index],
                    sunrise: weatherData.daily.sunrise ? weatherData.daily.sunrise[index] : null,
                    sunset: weatherData.daily.sunset ? weatherData.daily.sunset[index] : null,
                  };
                  return (
                    <ForecastCard
                      key={date}
                      dayData={dayData}
                      unit={unit}
                      isToday={index === 0}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
