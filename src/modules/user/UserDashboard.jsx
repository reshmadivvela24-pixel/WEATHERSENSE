import React, { useState, useEffect } from 'react';
import {
  geocodeCity,
  fetchWeather,
  reverseGeocode,
  getWeatherDescription,
  getWeatherEmoji,
  getConditionTip,
  celsiusToFahrenheit,
  formatDayShort,
} from '../../services/weatherApi';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getRecentSearches,
  addRecentSearch,
  getTips,
  getAnnouncements,
  incrementSearchCount,
  logActivity,
} from '../../services/storage';

export default function UserDashboard({ session }) {
  const [cityInput, setCityInput] = useState('');
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading weather data...');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAction, setRetryAction] = useState(null);

  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activeCity, setActiveCity] = useState(null);
  const [activeCountry, setActiveCountry] = useState('');
  const [isFav, setIsFav] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [customTips, setCustomTips] = useState([]);

  // Load initial lists from LocalStorage
  useEffect(() => {
    setFavorites(getFavorites());
    setRecentSearches(getRecentSearches());
    setAnnouncements(getAnnouncements());
    setCustomTips(getTips());

    // Auto-load London or Delhi on first launch if empty
    performSearch('New Delhi');
  }, []);

  // Update favorite status whenever active city changes
  useEffect(() => {
    if (activeCity) {
      setIsFav(isFavorite(activeCity));
    }
  }, [activeCity, favorites]);

  const performSearch = async (cityName) => {
    const trimmed = (cityName || '').trim();
    if (!trimmed) {
      setErrorMessage('Please enter a city name to search.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setLoadingMessage(`Searching weather for "${trimmed}"...`);

    try {
      const geo = await geocodeCity(trimmed);
      if (!geo) {
        setErrorMessage(`City "${trimmed}" was not found. Please verify spelling.`);
        setRetryAction(() => () => performSearch(trimmed));
        return;
      }

      await loadWeatherData(geo.latitude, geo.longitude, geo.name, geo.country);
    } catch (err) {
      const msg = err.message || 'Could not fetch weather data. Please check your network connection.';
      setErrorMessage(msg);
      setRetryAction(() => () => performSearch(trimmed));
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async (lat, lon, cityName, country) => {
    setLoading(true);
    setLoadingMessage(`Fetching weather for ${cityName}...`);
    setErrorMessage('');

    try {
      const data = await fetchWeather(lat, lon);

      setCurrentWeather(data.current);
      setForecast(data.daily);
      setActiveCity(cityName);
      setActiveCountry(country);

      addRecentSearch(cityName);
      setRecentSearches(getRecentSearches());
      incrementSearchCount();
      logActivity(`Weather searched for: ${cityName}${country ? ', ' + country : ''}`);
    } catch (err) {
      const msg = err.message || 'Error loading weather data.';
      setErrorMessage(msg);
      setRetryAction(() => () => loadWeatherData(lat, lon, cityName, country));
    } finally {
      setLoading(false);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setLoadingMessage('Requesting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const { cityName, country } = await reverseGeocode(latitude, longitude);
          await loadWeatherData(latitude, longitude, cityName, country);
        } catch (err) {
          setErrorMessage(err.message || 'Failed to retrieve weather for current location.');
          setRetryAction(() => () => handleMyLocation());
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        let msg = 'Location access denied.';
        if (err.code === 2) msg = 'Location position unavailable.';
        if (err.code === 3) msg = 'Location request timed out.';
        setErrorMessage(msg + ' Please search by city name instead.');
        setRetryAction(() => () => handleMyLocation());
      },
      { timeout: 10000 }
    );
  };

  const handleToggleFavorite = () => {
    if (!activeCity) return;
    if (isFavorite(activeCity)) {
      removeFavorite(activeCity);
    } else {
      addFavorite(activeCity);
    }
    setFavorites(getFavorites());
  };

  const handleRemoveFavorite = (e, city) => {
    e.stopPropagation();
    removeFavorite(city);
    setFavorites(getFavorites());
  };

  const convertTemp = (tempC) => {
    if (tempC === undefined || tempC === null) return '--';
    return unit === 'F' ? celsiusToFahrenheit(tempC) : Math.round(tempC);
  };

  return (
    <main className="user-main">
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="announcement-bar">
          <span className="material-symbols-outlined ann-icon">campaign</span>
          <span className="announcement-bar-text">
            <strong>Campus Announcement:</strong> {announcements[0]}
          </span>
        </div>
      )}

      {/* City Search Bar & Unit Toggle Card */}
      <section className="search-section card" aria-label="City search">
        <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              performSearch(cityInput);
            }}
          >
            <input
              className="form-input"
              type="text"
              placeholder="Search for a city (e.g., London, Tokyo, Mumbai, New York)..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              aria-label="City name"
            />
            <button className="btn btn-primary" type="submit">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                search
              </span>
              Search
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleMyLocation}
              title="Use current geolocation"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                my_location
              </span>
              My Location
            </button>
          </form>

          <div className="unit-toggle">
            <span className="unit-toggle-label">Temperature Unit:</span>
            <div className="unit-toggle-btns" role="group" aria-label="Temperature unit">
              <button
                className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
                onClick={() => setUnit('C')}
                type="button"
                aria-pressed={unit === 'C'}
              >
                °C
              </button>
              <button
                className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
                onClick={() => setUnit('F')}
                type="button"
                aria-pressed={unit === 'F'}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert Box with Retry */}
      {errorMessage && (
        <div
          className="alert alert-error"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className="material-symbols-outlined alert-icon">error</span>
            <span>{errorMessage}</span>
          </div>
          {retryAction && (
            <button
              className="btn btn-sm btn-outline"
              type="button"
              onClick={() => {
                setErrorMessage('');
                retryAction();
              }}
              style={{
                borderColor: 'currentColor',
                color: 'inherit',
                background: 'rgba(255,255,255,0.7)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                refresh
              </span>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Current Weather Card */}
      {currentWeather && activeCity && (
        <section className="weather-card" aria-label="Current weather">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
            }}
          >
            <div>
              <div className="weather-city">{activeCity}</div>
              <div className="weather-country">{activeCountry || 'Global Weather'}</div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                <span className="temp-display">{convertTemp(currentWeather.temperature_2m)}</span>
                <span className="temp-unit">°{unit}</span>
              </div>

              <div className="weather-condition">
                <span className="weather-icon-lg">
                  {getWeatherEmoji(currentWeather.weather_code)}
                </span>
                <span>{getWeatherDescription(currentWeather.weather_code)}</span>
              </div>
            </div>
          </div>

          {/* Meta Chips */}
          <div className="weather-meta">
            <span className="weather-chip">
              <span className="material-symbols-outlined chip-icon">thermostat</span>
              Feels like {convertTemp(currentWeather.apparent_temperature)}°{unit}
            </span>
            <span className="weather-chip">
              <span className="material-symbols-outlined chip-icon">water_drop</span>
              Humidity {currentWeather.relative_humidity_2m}%
            </span>
            <span className="weather-chip">
              <span className="material-symbols-outlined chip-icon">air</span>
              Wind {Math.round(currentWeather.wind_speed_10m)} km/h
            </span>
          </div>

          {/* Actions */}
          <div className="weather-actions">
            <button
              className={`btn-weather-fav ${isFav ? 'is-fav' : ''}`}
              onClick={handleToggleFavorite}
              type="button"
            >
              <span>{isFav ? '★' : '⭐'}</span>
              <span>{isFav ? 'Saved in Favorites' : 'Add to Favorites'}</span>
            </button>
          </div>

          {/* Weather Tip Box */}
          <div className="weather-tip-box" style={{ marginTop: 'var(--space-md)' }}>
            <span className="tip-icon">💡</span>
            <span>{getConditionTip(currentWeather.weather_code, customTips)}</span>
          </div>
        </section>
      )}

      {/* 5-Day Forecast */}
      {forecast && forecast.time && (
        <section className="card" aria-label="5-day forecast">
          <div className="card-header">
            <h2>📅 5-Day Weather Forecast</h2>
          </div>
          <div className="card-body">
            <div className="forecast-grid">
              {forecast.time.slice(0, 5).map((date, idx) => (
                <div key={date} className="forecast-card">
                  <div className="forecast-day">{formatDayShort(date)}</div>
                  <div className="forecast-emoji">
                    {getWeatherEmoji(forecast.weather_code[idx])}
                  </div>
                  <div className="forecast-temp-max">
                    {convertTemp(forecast.temperature_2m_max[idx])}°{unit}
                  </div>
                  <div className="forecast-temp-min">
                    {convertTemp(forecast.temperature_2m_min[idx])}°{unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Favorites & Recent Searches */}
      <div className="sidebar-sections">
        {/* Favorite Cities */}
        <section className="card" aria-label="Favorite cities">
          <div className="card-header">
            <h3>⭐ Favorite Cities</h3>
            <span className="badge badge-neutral">{favorites.length}</span>
          </div>
          <div className="city-list">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>No favorites saved yet.<br />Search a city and tap "Add to Favorites".</p>
              </div>
            ) : (
              favorites.map((city) => (
                <div
                  key={city}
                  className="city-item"
                  onClick={() => {
                    setCityInput(city);
                    performSearch(city);
                  }}
                >
                  <span className="city-item-name">{city}</span>
                  <div className="city-item-actions">
                    <button
                      className="city-item-remove"
                      onClick={(e) => handleRemoveFavorite(e, city)}
                      title="Remove favorite"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Searches */}
        <section className="card" aria-label="Recent searches">
          <div className="card-header">
            <h3>🕐 Recent Searches</h3>
            <span className="badge badge-neutral">{recentSearches.length}</span>
          </div>
          <div className="city-list">
            {recentSearches.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🕐</div>
                <p>No recent searches yet.</p>
              </div>
            ) : (
              recentSearches.map((city) => (
                <div
                  key={city}
                  className="city-item"
                  onClick={() => {
                    setCityInput(city);
                    performSearch(city);
                  }}
                >
                  <span className="city-item-name">🕐 {city}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Announcements Full List */}
      {announcements.length > 0 && (
        <section className="card" aria-label="Campus announcements">
          <div className="card-header">
            <h2>📢 Campus Weather Advisories & Announcements</h2>
            <span className="badge badge-info">{announcements.length}</span>
          </div>
          <div
            className="card-body"
            style={{
              padding: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}
          >
            {announcements.map((ann, idx) => (
              <div key={idx} className="announcement-card-item">
                <span className="ann-item-icon">📢</span>
                <span className="ann-item-text">{ann}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{loadingMessage}</p>
        </div>
      )}
    </main>
  );
}
