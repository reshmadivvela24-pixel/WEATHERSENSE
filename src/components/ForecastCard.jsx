import React from 'react';
import {
  getWeatherDetails,
  formatTemp,
  formatDayName,
  formatShortDate,
  formatTime,
} from '../services/weatherService';

export default function ForecastCard({ dayData, unit = 'C', isToday = false }) {
  if (!dayData) return null;

  const { date, weatherCode, maxTemp, minTemp, sunrise, sunset } = dayData;
  const details = getWeatherDetails(weatherCode);

  return (
    <div className={`ws-forecast-card ws-glass ${isToday ? 'today-highlight' : ''}`}>
      <div className="ws-forecast-header">
        <span className="ws-forecast-day">{isToday ? 'Today' : formatDayName(date)}</span>
        <span className="ws-forecast-date">{formatShortDate(date)}</span>
      </div>

      <div className="ws-forecast-visual">
        <span className="ws-forecast-icon">{details.icon}</span>
        <span className="ws-forecast-condition">{details.condition}</span>
      </div>

      <div className="ws-forecast-temps">
        <div className="ws-temp-high">
          <span className="ws-temp-label">High</span>
          <span className="ws-temp-num">{formatTemp(maxTemp, unit)}°{unit}</span>
        </div>
        <div className="ws-temp-divider"></div>
        <div className="ws-temp-low">
          <span className="ws-temp-label">Low</span>
          <span className="ws-temp-num">{formatTemp(minTemp, unit)}°{unit}</span>
        </div>
      </div>

      {(sunrise || sunset) && (
        <div className="ws-forecast-sun">
          {sunrise && <span title="Sunrise">🌅 {formatTime(sunrise)}</span>}
          {sunset && <span title="Sunset">🌇 {formatTime(sunset)}</span>}
        </div>
      )}
    </div>
  );
}
