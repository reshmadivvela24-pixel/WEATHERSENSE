// ============================================================
// SDC WEATHER APP – Open-Meteo Weather API Service
// ============================================================

export const API_ENDPOINTS = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER: 'https://api.open-meteo.com/v1/forecast',
  REVERSE: 'https://nominatim.openstreetmap.org/reverse',
};

export async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Weather request timed out after 10 seconds. Please check your internet connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function geocodeCity(cityName) {
  const url = `${API_ENDPOINTS.GEOCODING}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const response = await fetchWithTimeout(url, {}, 10000);
  if (!response.ok) {
    throw new Error(`Geocoding server responded with status ${response.status}`);
  }
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  const r = data.results[0];
  return {
    name: r.name,
    country: r.country || '',
    latitude: r.latitude,
    longitude: r.longitude,
  };
}

export async function fetchWeather(lat, lon) {
  const url =
    `${API_ENDPOINTS.WEATHER}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=5`;

  const response = await fetchWithTimeout(url, {}, 10000);
  if (!response.ok) {
    throw new Error(`Weather service returned HTTP error ${response.status}`);
  }
  const data = await response.json();
  if (!data || !data.current) {
    throw new Error('Received incomplete weather data from service.');
  }
  return data;
}

export async function reverseGeocode(lat, lon) {
  try {
    const url = `${API_ENDPOINTS.REVERSE}?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en' } }, 5000);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'My Location';
      const country = addr.country || '';
      return { cityName, country };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }
  return { cityName: 'My Location', country: '' };
}

// ── WMO Weather Code Helpers ──

export function getWeatherDescription(code) {
  const map = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Heavy Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snowfall',
    73: 'Moderate Snowfall',
    75: 'Heavy Snowfall',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Heavy Hail',
  };
  return map[code] || 'Clear & Stable';
}

export function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '🌥️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code === 85 || code === 86) return '🌨️';
  if (code === 95 || code === 96 || code === 99) return '⛈️';
  return '🌡️';
}

export function getConditionTip(code, customTips = []) {
  if (customTips && customTips.length > 0) {
    const randomIdx = Math.floor(Math.random() * customTips.length);
    return customTips[randomIdx];
  }
  if (code === 0) return '☀️ Clear sky – Great day for outdoor campus activities! Stay hydrated.';
  if (code >= 1 && code <= 3) return '🌤️ Mild conditions – A light jacket might come in handy.';
  if (code === 45 || code === 48) return '🌫️ Foggy weather – Drive carefully and use low beam headlights on campus.';
  if (code >= 51 && code <= 67) return '🌧️ Rainy weather – Carry an umbrella and wear waterproof shoes on campus.';
  if (code >= 71 && code <= 77) return '❄️ Cold conditions – Bundle up and wear warm layers.';
  if (code >= 80 && code <= 82) return '🌦️ Expect intermittent rain showers – Keep an umbrella close.';
  if (code === 95 || code === 96 || code === 99) return '⛈️ Thunderstorm alert – Stay indoors and avoid open campus grounds!';
  return '🌡️ Check local conditions and dress appropriately.';
}

export function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

export function formatDayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
