import React from 'react';
import { getWeatherDetails, convertTemp } from '../utils/weatherApi';

export default function WeatherCard({ city, country, weather, unit }) {
  if (!weather) return null;

  const { condition, icon } = getWeatherDetails(weather.weather_code);
  const currentTemp = convertTemp(weather.temperature_2m, unit);
  const feelsLike = convertTemp(weather.apparent_temperature, unit);
  const humidity = weather.relative_humidity_2m;
  const windSpeed = Math.round(weather.wind_speed_10m);

  return (
    <section className="weather-card" aria-label="Current Weather Information">
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
          <div className="weather-city">{city}</div>
          <div className="weather-country">{country || 'Global Forecast'}</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              marginBottom: 'var(--space-sm)',
            }}
          >
            <span className="temp-display">{currentTemp}</span>
            <span className="temp-unit">°{unit}</span>
          </div>

          <div className="weather-condition">
            <span className="weather-icon-lg">{icon}</span>
            <span>{condition}</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics */}
      <div className="weather-meta">
        <span className="weather-chip">
          <span className="material-symbols-outlined chip-icon">thermostat</span>
          Feels Like: {feelsLike}°{unit}
        </span>
        <span className="weather-chip">
          <span className="material-symbols-outlined chip-icon">water_drop</span>
          Humidity: {humidity}%
        </span>
        <span className="weather-chip">
          <span className="material-symbols-outlined chip-icon">air</span>
          Wind Speed: {windSpeed} km/h
        </span>
      </div>

      {/* Helpful Student Weather Advisory */}
      <div className="weather-tip-box" style={{ marginTop: 'var(--space-md)' }}>
        <span className="tip-icon">💡</span>
        <span>
          {weather.weather_code >= 51
            ? 'Rainy conditions outside – take an umbrella to campus labs.'
            : weather.weather_code === 0
            ? 'Clear and sunny sky – great weather for campus outdoor sports!'
            : 'Mild campus conditions – have a productive academic day!'}
        </span>
      </div>
    </section>
  );
}
