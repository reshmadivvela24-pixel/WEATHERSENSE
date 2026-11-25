import React from 'react';
import { getWeatherDetails, formatTemp, formatTime } from '../services/weatherService';

export default function HourlyForecast({ hourlyData, unit = 'C' }) {
  if (!hourlyData || !hourlyData.time || !hourlyData.time.length) {
    return null;
  }

  // Find the next 24 hours starting from current local hour
  const now = new Date();
  const currentHourStr = now.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'
  
  let startIndex = hourlyData.time.findIndex((t) => t.startsWith(currentHourStr));
  if (startIndex === -1) {
    // If exact hour not found (e.g. timezone difference), find closest or use 0
    startIndex = 0;
  }

  const next24 = hourlyData.time.slice(startIndex, startIndex + 24);

  return (
    <section className="ws-hourly-section ws-glass" aria-label="Hourly Forecast">
      <div className="ws-section-header">
        <div>
          <h3 className="ws-section-heading">Hourly Forecast</h3>
          <p className="ws-section-sub">Next 24-hour weather projections</p>
        </div>
      </div>

      <div className="ws-hourly-scroll">
        {next24.map((timeStr, idx) => {
          const actualIdx = startIndex + idx;
          const temp = hourlyData.temperature ? hourlyData.temperature[actualIdx] : null;
          const code = hourlyData.weatherCode ? hourlyData.weatherCode[actualIdx] : 0;
          const humidity = hourlyData.humidity ? hourlyData.humidity[actualIdx] : null;
          const details = getWeatherDetails(code);
          const hourLabel = idx === 0 ? 'Now' : formatTime(timeStr);

          return (
            <div key={timeStr + '-' + idx} className="ws-hourly-card">
              <span className="ws-hourly-time">{hourLabel}</span>
              <span className="ws-hourly-icon" title={details.condition}>
                {details.icon}
              </span>
              <span className="ws-hourly-temp">{formatTemp(temp, unit)}°{unit}</span>
              <span className="ws-hourly-cond">{details.condition}</span>
              {humidity !== null && (
                <span className="ws-hourly-pop">💧 {humidity}%</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
