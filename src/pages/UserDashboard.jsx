import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import HourlyForecast from '../components/HourlyForecast';
import { useWeather } from '../context/WeatherContext';
import { getAnnouncements } from '../services/storageService';
import { searchCitySuggestions } from '../services/weatherService';

export default function UserDashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [validationError, setValidationError] = useState('');

  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const {
    currentCity,
    weatherData,
    unit,
    recentSearches,
    fetchWeather,
    fetchCurrentLocation,
    loading,
    loadingMsg,
    error,
  } = useWeather();

  const [announcements] = useState(() => getAnnouncements());

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when user types (debounced)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (validationError) setValidationError('');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length >= 2) {
      setIsSearchingSuggestions(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchCitySuggestions(trimmed);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (err) {
          console.warn('Error fetching city suggestions:', err);
          setSuggestions([]);
        } finally {
          setIsSearchingSuggestions(false);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearchingSuggestions(false);
    }
  };

  // Submit search
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);

    const trimmed = searchInput.trim();
    if (!trimmed) {
      setValidationError('Please enter a city name to search (e.g. Vijayawada, Hyderabad, London).');
      return;
    }

    setValidationError('');
    fetchWeather(trimmed);
  };

  // Select suggestion item
  const handleSelectSuggestion = (item) => {
    setSearchInput(item.name);
    setShowSuggestions(false);
    setValidationError('');
    fetchWeather(item);
  };

  // Click on recent search pill
  const handleRecentClick = (cityName) => {
    setSearchInput(cityName);
    setShowSuggestions(false);
    setValidationError('');
    fetchWeather(cityName);
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          {/* Prominent Weather Search Bar at Top of User Dashboard */}
          <section
            className="ws-search-section ws-glass"
            ref={searchContainerRef}
            aria-label="Weather Search Bar"
          >
            <form onSubmit={handleSearchSubmit} className="ws-search-form" role="search">
              <div className="ws-search-input-wrap">
                <span className="ws-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  className="ws-search-input"
                  placeholder="Search city name (e.g. Vijayawada, Hyderabad, London)"
                  value={searchInput}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSuggestions(false);
                  }}
                  disabled={loading}
                  autoComplete="off"
                  aria-label="Search city name"
                />

                {searchInput && (
                  <button
                    type="button"
                    className="ws-search-clear-btn"
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setValidationError('');
                    }}
                    title="Clear input"
                    aria-label="Clear search input"
                  >
                    ✕
                  </button>
                )}

                {/* City Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="ws-search-suggestions" role="listbox">
                    {suggestions.map((item, idx) => (
                      <button
                        key={`${item.name}-${item.latitude}-${item.longitude}-${idx}`}
                        type="button"
                        className="ws-suggestion-item"
                        onClick={() => handleSelectSuggestion(item)}
                        role="option"
                        aria-selected="false"
                      >
                        <span className="ws-suggestion-icon">📍</span>
                        <div className="ws-suggestion-text">
                          <span className="ws-suggestion-city">{item.name}</span>
                          <span className="ws-suggestion-country">
                            {[item.admin1, item.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="ws-search-actions">
                <button
                  type="submit"
                  className="ws-btn ws-btn-primary ws-btn-rounded ws-search-btn"
                  disabled={loading}
                  title="Search weather for entered city"
                >
                  {loading ? (
                    <>
                      <span className="ws-spinner-sm" aria-hidden="true"></span>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="ws-btn-icon" aria-hidden="true">🔍</span>
                      <span>Search</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="ws-btn ws-btn-secondary ws-btn-rounded ws-btn-geo"
                  onClick={fetchCurrentLocation}
                  disabled={loading}
                  title="Detect live GPS coordinates"
                >
                  <span className="ws-geo-icon" aria-hidden="true">📍</span>
                  <span>My Location</span>
                </button>
              </div>
            </form>

            {/* Validation or Error Message */}
            {(validationError || error) && (
              <div className="ws-search-error-alert" role="alert">
                <span className="ws-error-icon">⚠️</span>
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Loading Indicator Status */}
            {loading && loadingMsg && (
              <div className="ws-search-loading-bar">
                <div className="ws-spinner-sm"></div>
                <span className="ws-loading-text">{loadingMsg}</span>
              </div>
            )}

            {/* Recent Searches Row */}
            {recentSearches && recentSearches.length > 0 && (
              <div className="ws-recent-searches">
                <span className="ws-recent-label">Recent Searches:</span>
                <div className="ws-recent-pills">
                  {recentSearches.slice(0, 8).map((item, idx) => {
                    const cityName = typeof item === 'string' ? item : item.city;
                    const countryName = typeof item === 'object' && item.country ? ` (${item.country})` : '';
                    const isActive = cityName.toLowerCase() === currentCity.toLowerCase();
                    return (
                      <button
                        key={`${cityName}-${idx}`}
                        type="button"
                        className={`ws-recent-pill ${isActive ? 'active' : ''}`}
                        onClick={() => handleRecentClick(cityName)}
                        title={`Load weather for ${cityName}${countryName}`}
                      >
                        <span className="ws-recent-dot">●</span>
                        <span>{cityName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Campus Weather Advisory / Announcements */}
          {announcements && announcements.length > 0 && (
            <div className="ws-announcement-banner ws-glass">
              <span className="ws-ann-badge">Campus Weather Alert</span>
              <div className="ws-ann-content">
                <strong>{announcements[0].title}:</strong> {announcements[0].content}
              </div>
            </div>
          )}

          {/* Main Current Weather Card */}
          <div className="ws-weather-card-container">
            <WeatherCard />
          </div>

          {/* Hourly Forecast Section (Next 24 Hours) */}
          {weatherData && weatherData.hourly && (
            <HourlyForecast hourlyData={weatherData.hourly} unit={unit} />
          )}

          {/* 7-Day Forecast Section */}
          {weatherData && weatherData.daily && (
            <section className="ws-forecast-section">
              <div className="ws-section-header">
                <div>
                  <h3 className="ws-section-heading">7-Day Weather Forecast</h3>
                  <p className="ws-section-sub">
                    Weekly meteorological projections for <strong>{currentCity}</strong>
                  </p>
                </div>
              </div>

              <div className="ws-forecast-grid ws-forecast-grid-7">
                {weatherData.daily.time.slice(0, 7).map((date, index) => {
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
