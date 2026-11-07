import React from 'react';
import { useWeather } from '../context/WeatherContext';
import {
  getWeatherDetails,
  formatTemp,
  formatTime,
} from '../services/weatherService';

export default function WeatherCard() {
  const {
    currentCity,
    currentCountry,
    weatherData,
    loading,
    error,
    unit,
    isFavorite,
    toggleFavorite,
    fetchCurrentLocation,
  } = useWeather();

  if (loading) {
    return (
      <div className="ws-weather-card ws-glass ws-loading-card">
        <div className="ws-spinner"></div>
        <p className="ws-loading-text">Fetching live Open-Meteo weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ws-weather-card ws-glass ws-error-card">
        <span className="ws-error-icon">⚠️</span>
        <h3 className="ws-error-title">Unable to Load Weather</h3>
        <p className="ws-error-desc">{error}</p>
        <button
          type="button"
          className="ws-btn ws-btn-primary ws-mt-md"
          onClick={fetchCurrentLocation}
        >
          Try Current Location
        </button>
      </div>
    );
  }

  if (!weatherData || !weatherData.current) {
    return (
      <div className="ws-weather-card ws-glass">
        <p className="ws-muted">Search for a city or click "My Location" to view live forecast.</p>
      </div>
    );
  }

  const { current } = weatherData;
  const weatherDetails = getWeatherDetails(current.weatherCode);
  const isCityFavorite = isFavorite(currentCity);

  return (
    <div className="ws-weather-card ws-glass">
      {/* Header with City & Favorite Toggle */}
      <div className="ws-card-header">
        <div className="ws-card-location">
          <div className="ws-location-row">
            <span className="ws-loc-icon">📍</span>
            <h2 className="ws-city-title">{currentCity}</h2>
            {currentCountry && <span className="ws-country-pill">{currentCountry}</span>}
          </div>
          <span className="ws-weather-time">
            Live observation • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <button
          type="button"
          className={`ws-fav-toggle-btn ${isCityFavorite ? 'is-fav' : ''}`}
          onClick={() => toggleFavorite(currentCity)}
          title={isCityFavorite ? 'Remove from favorites' : 'Save to favorite cities'}
        >
          <span className="ws-star-icon">{isCityFavorite ? '★' : '☆'}</span>
          <span>{isCityFavorite ? 'Saved' : 'Favorite'}</span>
        </button>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="ws-card-hero">
        <div className="ws-hero-temp-block">
          <span className="ws-big-temp">{formatTemp(current.temperature, unit)}</span>
          <span className="ws-temp-unit">°{unit}</span>
        </div>

        <div className="ws-hero-condition-block">
          <span className="ws-hero-weather-icon">{weatherDetails.icon}</span>
          <div className="ws-hero-cond-text">
            <h3 className="ws-condition-name">{weatherDetails.condition}</h3>
            <span className="ws-feels-like">
              Feels like {formatTemp(current.feelsLike, unit)}°{unit}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Grid (Humidity, Wind, Pressure, Visibility, Sunrise, Sunset) */}
      <div className="ws-metrics-grid">
        <div className="ws-metric-box">
          <div className="ws-metric-icon">💧</div>
          <div className="ws-metric-info">
            <span className="ws-metric-label">Humidity</span>
            <span className="ws-metric-val">{current.humidity}%</span>
          </div>
        </div>

        <div className="ws-metric-box">
          <div className="ws-metric-icon">💨</div>
          <div className="ws-metric-info">
            <span className="ws-metric-label">Wind Speed</span>
            <span className="ws-metric-val">{current.windSpeed} km/h</span>
          </div>
        </div>

        <div className="ws-metric-box">
          <div className="ws-metric-icon">⏲️</div>
          <div className="ws-metric-info">
            <span className="ws-metric-label">Pressure</span>
            <span className="ws-metric-val">{current.pressure} hPa</span>
          </div>
        </div>

        <div className="ws-metric-box">
          <div className="ws-metric-info-visibility">
            <div className="ws-metric-icon">👁️</div>
            <div className="ws-metric-info">
              <span className="ws-metric-label">Visibility</span>
              <span className="ws-metric-val">{current.visibility} km</span>
            </div>
          </div>
        </div>

        <div className="ws-metric-box">
          <div className="ws-metric-icon">🌅</div>
          <div className="ws-metric-info">
            <span className="ws-metric-label">Sunrise</span>
            <span className="ws-metric-val">{formatTime(current.sunrise)}</span>
          </div>
        </div>

        <div className="ws-metric-box">
          <div className="ws-metric-icon">🌇</div>
          <div className="ws-metric-info">
            <span className="ws-metric-label">Sunset</span>
            <span className="ws-metric-val">{formatTime(current.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
