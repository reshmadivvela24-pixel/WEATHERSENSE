import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import WeatherCard from '../components/WeatherCard';
import Forecast from '../components/Forecast';
import {
  searchCityCoordinates,
  getWeatherData,
} from '../utils/weatherApi';
import {
  getCurrentUser,
  getStoredItem,
  setStoredItem,
  STORAGE_KEYS,
} from '../utils/storage';

export default function UserDashboard({ onLogout }) {
  const currentUser = getCurrentUser();

  const [cityInput, setCityInput] = useState('');
  const [activeCity, setActiveCity] = useState('New Delhi');
  const [activeCountry, setActiveCountry] = useState('India');
  const [weatherData, setWeatherData] = useState(null);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Fetching live weather...');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCity, setRetryCity] = useState(null);

  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches and initial weather on mount
  useEffect(() => {
    const savedRecents = getStoredItem(STORAGE_KEYS.RECENT_SEARCHES, ['New Delhi', 'London', 'Tokyo']);
    setRecentSearches(savedRecents);
    fetchWeatherForCity('New Delhi');
  }, []);

  // Save to recent searches
  const saveRecent = (cityName) => {
    let list = getStoredItem(STORAGE_KEYS.RECENT_SEARCHES, []);
    list = list.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
    list.unshift(cityName);
    if (list.length > 5) list = list.slice(0, 5);
    setStoredItem(STORAGE_KEYS.RECENT_SEARCHES, list);
    setRecentSearches(list);

    // Increment global search count in local storage
    const currentCount = getStoredItem(STORAGE_KEYS.SEARCH_COUNT, 0);
    setStoredItem(STORAGE_KEYS.SEARCH_COUNT, currentCount + 1);
  };

  // Perform Weather Search
  const fetchWeatherForCity = async (cityName) => {
    const cleanCity = (cityName || '').trim();
    if (!cleanCity) {
      setErrorMsg('Please enter a city name to search.');
      return;
    }

    setLoading(true);
    setLoadingMsg(`Looking up "${cleanCity}" via Open-Meteo Geocoding...`);
    setErrorMsg('');

    try {
      // 1. Geocode city name to coordinates
      const coords = await searchCityCoordinates(cleanCity);

      if (!coords) {
        setErrorMsg(`City "${cleanCity}" was not found. Please check spelling and try again.`);
        setRetryCity(cleanCity);
        setLoading(false);
        return;
      }

      setLoadingMsg(`Retrieving current weather & 5-day forecast for ${coords.name}...`);

      // 2. Fetch forecast data from Open-Meteo
      const data = await getWeatherData(coords.latitude, coords.longitude);

      setWeatherData(data);
      setActiveCity(coords.name);
      setActiveCountry(coords.country);
      saveRecent(coords.name);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch weather data. Please check your internet connection.');
      setRetryCity(cleanCity);
    } finally {
      setLoading(false);
    }
  };

  // Browser Geolocation: "My Location"
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Locating device position via GPS...');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setLoadingMsg('Fetching weather for your current coordinates...');
          const data = await getWeatherData(latitude, longitude);

          setWeatherData(data);
          setActiveCity('My Location');
          setActiveCountry('Current GPS Coordinates');
        } catch (err) {
          setErrorMsg(err.message || 'Could not fetch weather for current location.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        let msg = 'Location access permission was denied.';
        if (err.code === 2) msg = 'Location position unavailable.';
        if (err.code === 3) msg = 'Location request timed out.';
        setErrorMsg(msg + ' Please search by city name instead.');
      },
      { timeout: 10000 }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWeatherForCity(cityInput);
  };

  return (
    <div className="app-page">
      <Navbar user={currentUser} onLogout={onLogout} />

      <main className="user-main">
        {/* Search Bar Section */}
        <section className="search-section card" aria-label="City Weather Search">
          <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                className="form-input"
                type="text"
                placeholder="Search city (e.g., London, Mumbai, Tokyo, New York)..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                aria-label="City Name"
              />
              <button className="btn btn-primary" type="submit" disabled={loading}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  search
                </span>
                Search Weather
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleMyLocation}
                disabled={loading}
                title="Detect weather using your current device location"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  my_location
                </span>
                My Location
              </button>
            </form>

            {/* Celsius / Fahrenheit Toggle Controls */}
            <div className="unit-toggle">
              <span className="unit-toggle-label">Temperature Scale:</span>
              <div className="unit-toggle-btns" role="group" aria-label="Temperature unit selection">
                <button
                  className={`unit-btn ${unit === 'C' ? 'active' : ''}`}
                  onClick={() => setUnit('C')}
                  type="button"
                  aria-pressed={unit === 'C'}
                >
                  Celsius (°C)
                </button>
                <button
                  className={`unit-btn ${unit === 'F' ? 'active' : ''}`}
                  onClick={() => setUnit('F')}
                  type="button"
                  aria-pressed={unit === 'F'}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Error Alert Box with One-Click Retry */}
        {errorMsg && (
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
              <span>{errorMsg}</span>
            </div>
            {retryCity && (
              <button
                className="btn btn-sm btn-outline"
                type="button"
                onClick={() => fetchWeatherForCity(retryCity)}
                style={{
                  borderColor: 'currentColor',
                  color: 'inherit',
                  background: 'rgba(255,255,255,0.7)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  refresh
                </span>
                Retry Search
              </button>
            )}
          </div>
        )}

        {/* Weather Card Display */}
        {weatherData && (
          <WeatherCard
            city={activeCity}
            country={activeCountry}
            weather={weatherData.current}
            unit={unit}
          />
        )}

        {/* 5-Day Forecast Grid Display */}
        {weatherData && (
          <Forecast forecastData={weatherData.daily} unit={unit} />
        )}

        {/* Recent Searches Section */}
        <section className="card" aria-label="Recent Searches">
          <div className="card-header">
            <h3>🕐 Recent City Searches</h3>
            <span className="badge badge-neutral">{recentSearches.length} cities</span>
          </div>
          <div className="city-list">
            {recentSearches.length === 0 ? (
              <div className="empty-state">
                <p>No recent searches yet.</p>
              </div>
            ) : (
              recentSearches.map((city) => (
                <div
                  key={city}
                  className="city-item"
                  onClick={() => {
                    setCityInput(city);
                    fetchWeatherForCity(city);
                  }}
                  title={`View weather for ${city}`}
                >
                  <span className="city-item-name">🕐 {city}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>{loadingMsg}</p>
          </div>
        )}
      </main>
    </div>
  );
}
