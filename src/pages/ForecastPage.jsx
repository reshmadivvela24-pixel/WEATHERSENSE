import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ForecastCard from '../components/ForecastCard';
import { useWeather } from '../context/WeatherContext';
import { getWeatherDetails, formatTemp } from '../services/weatherService';

export default function ForecastPage() {
  const {
    currentCity,
    currentCountry,
    weatherData,
    unit,
    fetchWeather,
    loading,
  } = useWeather();

  const [inputCity, setInputCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      fetchWeather(inputCity.trim());
      setInputCity('');
    }
  };

  return (
    <div className="ws-page-wrapper">
      <Navbar />

      <div className="ws-dashboard-layout">
        <Sidebar />

        <main className="ws-main-content">
          {/* Header */}
          <div className="ws-forecast-page-header ws-glass">
            <div>
              <div className="ws-badge ws-badge-info">Multi-Day Projections</div>
              <h2 className="ws-admin-title">5-Day Meteorological Forecast</h2>
              <p className="ws-admin-desc">
                Extended atmospheric models for <strong>{currentCity}</strong>
                {currentCountry && `, ${currentCountry}`}
              </p>
            </div>

            {/* Change City Form */}
            <form onSubmit={handleSearch} className="ws-quick-search-form">
              <input
                type="text"
                placeholder="Switch forecast city..."
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                className="ws-input-sm"
                disabled={loading}
              />
              <button
                type="submit"
                className="ws-btn ws-btn-primary ws-btn-sm"
                disabled={loading || !inputCity.trim()}
              >
                {loading ? '...' : 'Go'}
              </button>
            </form>
          </div>

          {/* Forecast Cards Grid */}
          {weatherData && weatherData.daily ? (
            <div className="ws-forecast-page-grid">
              {weatherData.daily.time.slice(0, 5).map((date, idx) => {
                const dayData = {
                  date,
                  weatherCode: weatherData.daily.weatherCode[idx],
                  maxTemp: weatherData.daily.maxTemp[idx],
                  minTemp: weatherData.daily.minTemp[idx],
                  sunrise: weatherData.daily.sunrise ? weatherData.daily.sunrise[idx] : null,
                  sunset: weatherData.daily.sunset ? weatherData.daily.sunset[idx] : null,
                };
                const details = getWeatherDetails(dayData.weatherCode);

                return (
                  <div key={date} className="ws-forecast-detail-card ws-glass">
                    <div className="ws-f-card-top">
                      <span className="ws-f-badge">{idx === 0 ? 'Today' : `Day +${idx}`}</span>
                      <span className="ws-f-date">{date}</span>
                    </div>

                    <div className="ws-f-hero">
                      <span className="ws-f-big-icon">{details.icon}</span>
                      <div className="ws-f-meta">
                        <h4 className="ws-f-condition">{details.condition}</h4>
                        <span className="ws-f-badge-sub">{details.badge}</span>
                      </div>
                    </div>

                    <div className="ws-f-temp-bar">
                      <div className="ws-f-temp-box high">
                        <span className="label">Peak High</span>
                        <span className="val">{formatTemp(dayData.maxTemp, unit)}°{unit}</span>
                      </div>
                      <div className="ws-f-temp-box low">
                        <span className="label">Night Low</span>
                        <span className="val">{formatTemp(dayData.minTemp, unit)}°{unit}</span>
                      </div>
                    </div>

                    <div className="ws-f-sun-meta">
                      <div className="ws-f-sun-item">
                        <span>🌅 Sunrise</span>
                        <strong>
                          {dayData.sunrise
                            ? new Date(dayData.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </strong>
                      </div>
                      <div className="ws-f-sun-item">
                        <span>🌇 Sunset</span>
                        <strong>
                          {dayData.sunset
                            ? new Date(dayData.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ws-weather-card ws-glass ws-loading-card">
              <div className="ws-spinner"></div>
              <p className="ws-loading-text">Loading 5-day projections from Open-Meteo...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
