// ============================================================
// WEATHER SENSE - Open-Meteo Weather API Service
// Fully functional real-time weather & geocoding integration
// ============================================================

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEOCODE_BASE = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Fetch with automatic 10-second timeout using AbortController
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
 * Geocode city name to Latitude, Longitude, and Country
 */
export async function geocodeCity(cityName) {
  const cleanName = encodeURIComponent(cityName.trim());
  const url = `${GEOCODING_BASE}?name=${cleanName}&count=1&language=en&format=json`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Geocoding server error (${res.status}).`);
  }

  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    return null; // City not found
  }

  const first = data.results[0];
  return {
    name: first.name,
    country: first.country || '',
    countryCode: first.country_code || '',
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone || 'auto',
  };
}

/**
 * Reverse Geocode coordinates to a human-readable city name
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `${REVERSE_GEOCODE_BASE}?format=json&lat=${latitude}&lon=${longitude}`;
    const res = await fetchWithTimeout(url, { headers: { 'Accept-Language': 'en' } }, 5000);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Current Location';
      const country = addr.country || '';
      return { cityName, country };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }
  return { cityName: 'Current Location', country: '' };
}

/**
 * Fetch Comprehensive Weather Data:
 * - Current Temperature, Feels Like, Humidity, Wind, Pressure, Weather Code
 * - Sunrise & Sunset for today
 * - Hourly Visibility for the current hour
 * - 5-Day Daily Forecast with Max/Min temps
 */
export async function getWeatherData(latitude, longitude) {
  const url =
    `${FORECAST_BASE}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
    `&hourly=visibility` +
    `&timezone=auto&forecast_days=6`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo Weather API responded with error code ${res.status}.`);
  }

  const data = await res.json();
  if (!data.current || !data.daily) {
    throw new Error('Received incomplete weather information from Open-Meteo.');
  }

  // Extract current visibility from hourly data
  let currentVisibilityKm = 10.0; // default healthy visibility
  if (data.hourly && data.hourly.visibility && data.hourly.time) {
    const nowIso = new Date().toISOString().slice(0, 13); // match YYYY-MM-DDTHH
    const index = data.hourly.time.findIndex((t) => t.startsWith(nowIso));
    if (index !== -1 && data.hourly.visibility[index] !== undefined) {
      currentVisibilityKm = Math.round(data.hourly.visibility[index] / 100) / 10;
    } else if (data.hourly.visibility[0]) {
      currentVisibilityKm = Math.round(data.hourly.visibility[0] / 100) / 10;
    }
  }

  return {
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      pressure: Math.round(data.current.surface_pressure),
      visibility: currentVisibilityKm,
      weatherCode: data.current.weather_code,
      sunrise: data.daily.sunrise ? data.daily.sunrise[0] : null,
      sunset: data.daily.sunset ? data.daily.sunset[0] : null,
      time: data.current.time,
    },
    daily: {
      time: data.daily.time,
      weatherCode: data.daily.weather_code,
      maxTemp: data.daily.temperature_2m_max,
      minTemp: data.daily.temperature_2m_min,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
    },
  };
}

/**
 * WMO Weather Code Mapper
 */
export function getWeatherDetails(code) {
  const map = {
    0: { condition: 'Clear Sky', icon: '☀️', iconName: 'Sun', badge: 'Sunny' },
    1: { condition: 'Mainly Clear', icon: '🌤️', iconName: 'SunCloud', badge: 'Partly Sunny' },
    2: { condition: 'Partly Cloudy', icon: '⛅', iconName: 'CloudSun', badge: 'Scattered Clouds' },
    3: { condition: 'Overcast', icon: '🌥️', iconName: 'Cloud', badge: 'Cloudy' },
    45: { condition: 'Foggy', icon: '🌫️', iconName: 'CloudFog', badge: 'Low Visibility' },
    48: { condition: 'Rime Fog', icon: '🌫️', iconName: 'CloudFog', badge: 'Icy Fog' },
    51: { condition: 'Light Drizzle', icon: '🌦️', iconName: 'CloudDrizzle', badge: 'Light Drizzle' },
    53: { condition: 'Moderate Drizzle', icon: '🌦️', iconName: 'CloudDrizzle', badge: 'Drizzle' },
    55: { condition: 'Dense Drizzle', icon: '🌧️', iconName: 'CloudRain', badge: 'Heavy Drizzle' },
    61: { condition: 'Slight Rain', icon: '🌧️', iconName: 'CloudRain', badge: 'Showers' },
    63: { condition: 'Moderate Rain', icon: '🌧️', iconName: 'CloudRain', badge: 'Steady Rain' },
    65: { condition: 'Heavy Rain', icon: '⛈️', iconName: 'CloudRain', badge: 'Downpour' },
    71: { condition: 'Slight Snowfall', icon: '🌨️', iconName: 'CloudSnow', badge: 'Snow Flurries' },
    73: { condition: 'Moderate Snowfall', icon: '❄️', iconName: 'Snowflake', badge: 'Snow' },
    75: { condition: 'Heavy Snowfall', icon: '❄️', iconName: 'Snowflake', badge: 'Blizzard' },
    77: { condition: 'Snow Grains', icon: '🌨️', iconName: 'CloudSnow', badge: 'Ice Pellets' },
    80: { condition: 'Rain Showers', icon: '🌦️', iconName: 'CloudSunRain', badge: 'Passing Showers' },
    81: { condition: 'Moderate Showers', icon: '🌧️', iconName: 'CloudRain', badge: 'Showers' },
    82: { condition: 'Violent Showers', icon: '⛈️', iconName: 'CloudLightning', badge: 'Squall' },
    85: { condition: 'Snow Showers', icon: '🌨️', iconName: 'CloudSnow', badge: 'Flurries' },
    86: { condition: 'Heavy Snow Showers', icon: '❄️', iconName: 'Snowflake', badge: 'Heavy Snow' },
    95: { condition: 'Thunderstorm', icon: '⛈️', iconName: 'CloudLightning', badge: 'Severe Storm' },
    96: { condition: 'Thunderstorm with Hail', icon: '⛈️', iconName: 'CloudLightning', badge: 'Hailstorm' },
    99: { condition: 'Severe Thunderstorm', icon: '🌩️', iconName: 'Zap', badge: 'Violent Storm' },
  };

  return map[code] || { condition: 'Stable Weather', icon: '🌤️', iconName: 'Sun', badge: 'Normal' };
}

/**
 * Temperature Unit Converter
 */
export function formatTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Format ISO time into AM/PM string (e.g. "06:14 AM")
 */
export function formatTime(isoString) {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return '--:--';
  }
}

/**
 * Format Date into Weekday name
 */
export function formatDayName(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString + 'T00:00:00');
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } catch (e) {
    return dateString;
  }
}

/**
 * Format Date into Month & Day (e.g., "Nov 06")
 */
export function formatShortDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
}
