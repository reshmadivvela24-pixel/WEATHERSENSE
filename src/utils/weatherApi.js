// ============================================================
// Open-Meteo Free Weather API Client
// Handles Geocoding, Forecasts, and WMO Weather Codes
// ============================================================

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch with automatic 10-second timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Weather request timed out after 10 seconds. Please check your internet connection.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Convert City Name into Latitude & Longitude using Geocoding API
 */
export async function searchCityCoordinates(cityName) {
  const cleanName = encodeURIComponent(cityName.trim());
  const url = `${GEOCODING_URL}?name=${cleanName}&count=1&language=en&format=json`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error('Geocoding service unavailable.');
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    return null; // City not found
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country || '',
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/**
 * Fetch Current Weather & 5-Day Forecast by Coordinates
 */
export async function getWeatherData(latitude, longitude) {
  const url = `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error('Weather forecast service returned an error.');
  }

  const data = await res.json();
  if (!data.current || !data.daily) {
    throw new Error('Incomplete weather information received.');
  }

  return data;
}

/**
 * Map standard WMO Weather Codes to descriptive conditions and emojis
 */
export function getWeatherDetails(code) {
  const codeMap = {
    0: { condition: 'Clear Sky', icon: '☀️' },
    1: { condition: 'Mainly Clear', icon: '🌤️' },
    2: { condition: 'Partly Cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '🌥️' },
    45: { condition: 'Foggy', icon: '🌫️' },
    48: { condition: 'Depositing Rime Fog', icon: '🌫️' },
    51: { condition: 'Light Drizzle', icon: '🌦️' },
    53: { condition: 'Moderate Drizzle', icon: '🌦️' },
    55: { condition: 'Dense Drizzle', icon: '🌧️' },
    61: { condition: 'Slight Rain', icon: '🌧️' },
    63: { condition: 'Moderate Rain', icon: '🌧️' },
    65: { condition: 'Heavy Rain', icon: '⛈️' },
    71: { condition: 'Slight Snowfall', icon: '🌨️' },
    73: { condition: 'Moderate Snowfall', icon: '❄️' },
    75: { condition: 'Heavy Snowfall', icon: '❄️' },
    77: { condition: 'Snow Grains', icon: '🌨️' },
    80: { condition: 'Slight Rain Showers', icon: '🌦️' },
    81: { condition: 'Moderate Rain Showers', icon: '🌧️' },
    82: { condition: 'Violent Rain Showers', icon: '⛈️' },
    85: { condition: 'Slight Snow Showers', icon: '🌨️' },
    86: { condition: 'Heavy Snow Showers', icon: '❄️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm with Hail', icon: '⛈️' },
    99: { condition: 'Severe Thunderstorm', icon: '🌩️' },
  };

  return codeMap[code] || { condition: 'Mild Weather', icon: '🌤️' };
}

/**
 * Convert Celsius to Fahrenheit
 */
export function convertTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Format date string into day of week (e.g., "Mon", "Tue")
 */
export function formatDay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
