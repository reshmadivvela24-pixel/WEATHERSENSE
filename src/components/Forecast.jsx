import React from 'react';
import { getWeatherDetails, convertTemp, formatDay } from '../utils/weatherApi';

export default function Forecast({ forecastData, unit }) {
  if (!forecastData || !forecastData.time) return null;

  // Render 5 days
  const days = forecastData.time.slice(0, 5);

  return (
    <section className="card" aria-label="5-Day Weather Forecast">
      <div className="card-header">
        <h2>📅 5-Day Weather Forecast</h2>
      </div>
      <div className="card-body">
        <div className="forecast-grid">
          {days.map((dateStr, idx) => {
            const code = forecastData.weather_code[idx];
            const { condition, icon } = getWeatherDetails(code);
            const maxTemp = convertTemp(forecastData.temperature_2m_max[idx], unit);
            const minTemp = convertTemp(forecastData.temperature_2m_min[idx], unit);
            const dayName = formatDay(dateStr);

            return (
              <div key={dateStr} className="forecast-card" title={condition}>
                <div className="forecast-day">{dayName}</div>
                <div className="forecast-emoji">{icon}</div>
                <div className="forecast-temp-max">{maxTemp}°{unit}</div>
                <div className="forecast-temp-min">{minTemp}°{unit}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
