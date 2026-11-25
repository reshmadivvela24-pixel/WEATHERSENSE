import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  geocodeCity,
  getWeatherData,
  reverseGeocode,
  searchCitySuggestions,
} from '../services/weatherService';
import {
  getFavorites,
  addFavorite as saveFavorite,
  removeFavorite as deleteFavorite,
  isFavorite as checkFavorite,
  getRecentSearches,
  recordSearch,
} from '../services/storageService';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [currentCity, setCurrentCity] = useState('New Delhi');
  const [currentCountry, setCurrentCountry] = useState('India');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'

  const [favorites, setFavorites] = useState(() => getFavorites());
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());

  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  // Fetch weather for a given city name or location object
  const fetchWeather = useCallback(async (cityOrLocation) => {
    let clean = '';
    let location = null;

    if (cityOrLocation && typeof cityOrLocation === 'object' && cityOrLocation.latitude !== undefined) {
      location = cityOrLocation;
      clean = location.name;
    } else {
      clean = (cityOrLocation || '').trim();
      if (!clean) {
        setError('Please enter a city name to search.');
        return false;
      }
    }

    setLoading(true);
    setLoadingMsg(`Searching weather for "${clean}"...`);
    setError(null);

    try {
      if (!location) {
        // 1. Geocode with count=5
        location = await geocodeCity(clean);
        if (!location) {
          setError(`City "${clean}" was not found. Please verify spelling.`);
          setLoading(false);
          return false;
        }
      }

      setLoadingMsg(`Retrieving live weather for ${location.name}, ${location.country}...`);

      // 2. Weather
      const data = await getWeatherData(location.latitude, location.longitude);

      setCurrentCity(location.name);
      setCurrentCountry(location.country);
      setWeatherData(data);

      // Record in recent searches & metrics
      recordSearch(location.name, location.country);
      setRecentSearches(getRecentSearches());

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Fetch weather error:', err);
      setError(err.message || 'Unable to fetch weather data. Please try again.');
      setLoading(false);
      return false;
    }
  }, []);

  // Fetch weather using browser geolocation
  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Locating device coordinates via GPS...');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          setLoadingMsg('Identified location. Reverse geocoding...');
          const { cityName, country } = await reverseGeocode(lat, lon);

          setLoadingMsg(`Fetching live weather for ${cityName}...`);
          const data = await getWeatherData(lat, lon);

          setCurrentCity(cityName);
          setCurrentCountry(country);
          setWeatherData(data);

          recordSearch(cityName, country);
          setRecentSearches(getRecentSearches());

          setLoading(false);
        } catch (err) {
          console.error('Location weather error:', err);
          setError(err.message || 'Failed to fetch weather for current location.');
          setLoading(false);
        }
      },
      (geoErr) => {
        let msg = 'Could not access device location.';
        if (geoErr.code === 1) {
          msg = 'Location permission denied. Please allow location access or search manually.';
        } else if (geoErr.code === 2) {
          msg = 'Location position unavailable. Please search by city name.';
        } else if (geoErr.code === 3) {
          msg = 'Location request timed out. Please try searching manually.';
        }
        setError(msg);
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Favorites toggle
  const toggleFavorite = (cityName) => {
    const target = cityName || currentCity;
    if (checkFavorite(target)) {
      deleteFavorite(target);
    } else {
      saveFavorite(target);
    }
    setFavorites(getFavorites());
  };

  const isFav = (cityName) => {
    return checkFavorite(cityName || currentCity);
  };

  // Initial load
  useEffect(() => {
    fetchWeather('New Delhi');
  }, [fetchWeather]);

  const value = {
    currentCity,
    currentCountry,
    weatherData,
    loading,
    loadingMsg,
    error,
    unit,
    toggleUnit,
    favorites,
    isFavorite: isFav,
    toggleFavorite,
    recentSearches,
    fetchWeather,
    fetchCurrentLocation,
    searchSuggestions: searchCitySuggestions,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
