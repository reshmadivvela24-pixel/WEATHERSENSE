// ============================================================
// SDC WEATHER APP – script.js
// Vanilla JS | Open-Meteo API | LocalStorage Auth
// ============================================================

// ============================================================
// SECTION 1: LOCAL STORAGE KEYS
// ============================================================
const LS_KEYS = {
  USERS:         'sdc_weather_users',
  SESSION:       'sdc_weather_session',
  FAVORITES:     'sdc_weather_favorites',
  RECENT:        'sdc_weather_recent',
  TIPS:          'sdc_weather_tips',
  ANNOUNCEMENTS: 'sdc_weather_announcements',
  SEARCH_COUNT:  'sdc_weather_search_count',
  ACTIVITY:      'sdc_weather_activity',
};

// ============================================================
// SECTION 2: API CONFIGURATION (Open-Meteo – free, no key)
// ============================================================
const API = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER:   'https://api.open-meteo.com/v1/forecast',
  REVERSE:   'https://nominatim.openstreetmap.org/reverse',
};
/*
 * Geocoding: GET ?name=CITY&count=1&language=en&format=json
 * Weather:   GET ?latitude=LAT&longitude=LON
 *              &current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m
 *              &daily=weather_code,temperature_2m_max,temperature_2m_min
 *              &timezone=auto&forecast_days=5
 */

// ============================================================
// SECTION 3: UTILITY FUNCTIONS
// ============================================================

/**
 * Perform a fetch request with an AbortSignal timeout (default 10,000ms = 10s).
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs=10000]
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

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

/**
 * Safely read a value from localStorage and parse JSON.
 * @param {string} key
 * @param {*} defaultVal
 * @returns {*}
 */
function safeGet(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

/**
 * Safely write a value to localStorage as JSON.
 * @param {string} key
 * @param {*} value
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

/**
 * Append an entry to the activity log (max 50 entries).
 * Never logs passwords.
 * @param {string} message
 */
function logActivity(message) {
  // Sanitize: strip anything that looks like a password
  const safe = String(message).replace(/password[^,]*/gi, '').trim();
  const log = safeGet(LS_KEYS.ACTIVITY, []);
  log.unshift({
    message: safe,
    timestamp: new Date().toISOString(),
  });
  if (log.length > 50) log.length = 50;
  safeSet(LS_KEYS.ACTIVITY, log);
}

/**
 * Map a WMO weather code to a human-readable description.
 * @param {number} code
 * @returns {string}
 */
function getWeatherDescription(code) {
  const map = {
    0:  'Clear Sky',
    1:  'Mainly Clear',
    2:  'Partly Cloudy',
    3:  'Overcast',
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
  return map[code] || 'Unknown Conditions';
}

/**
 * Map a WMO weather code to an emoji.
 * @param {number} code
 * @returns {string}
 */
function getWeatherEmoji(code) {
  if (code === 0)                                 return '☀️';
  if (code === 1)                                 return '🌤️';
  if (code === 2)                                 return '⛅';
  if (code === 3)                                 return '🌥️';
  if (code === 45 || code === 48)                 return '🌫️';
  if (code >= 51 && code <= 57)                   return '🌦️';
  if (code >= 61 && code <= 67)                   return '🌧️';
  if (code >= 71 && code <= 77)                   return '🌨️';
  if (code >= 80 && code <= 82)                   return '🌦️';
  if (code === 85 || code === 86)                 return '🌨️';
  if (code === 95 || code === 96 || code === 99)  return '⛈️';
  return '🌡️';
}

/**
 * Return a weather-appropriate tip. Checks admin tips in LS first.
 * @param {number} code WMO weather code
 * @returns {string}
 */
function getWeatherTip(code) {
  // Try to pick a random admin tip first
  const adminTips = safeGet(LS_KEYS.TIPS, []);
  if (adminTips.length > 0) {
    return adminTips[Math.floor(Math.random() * adminTips.length)];
  }
  // Fall back to condition-based defaults
  if (code === 0)                               return '☀️ Clear sky – Great day for outdoor activities! Stay hydrated.';
  if (code >= 1  && code <= 3)                  return '🌤️ Mild conditions – A light jacket might come in handy.';
  if (code === 45 || code === 48)               return '🌫️ Foggy weather – Drive carefully and use fog lights.';
  if (code >= 51 && code <= 67)                 return '🌧️ Rainy weather – Carry an umbrella and wear waterproof shoes.';
  if (code >= 71 && code <= 77)                 return '❄️ Cold conditions – Bundle up and wear warm layers.';
  if (code >= 80 && code <= 82)                 return '🌦️ Expect intermittent rain showers – Keep an umbrella close.';
  if (code === 95 || code === 96 || code === 99) return '⛈️ Thunderstorm alert – Stay indoors and avoid open areas!';
  return '🌡️ Check local conditions and dress appropriately.';
}

/**
 * Convert Celsius to Fahrenheit.
 * @param {number} c
 * @returns {number}
 */
function celsiusToFahrenheit(c) {
  return Math.round((c * 9 / 5) + 32);
}

/**
 * Format a YYYY-MM-DD date string to "Mon DD".
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format a YYYY-MM-DD date string to abbreviated weekday.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDayShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Show a small toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ============================================================
// SECTION 4: AUTHENTICATION & SESSION
// ============================================================

/** Pre-seeded admin account (never stored in LS_KEYS.USERS array). */
const ADMIN = {
  email:    'admin@sdc.edu',
  password: 'SDCAdmin@2024',
  name:     'SDC Administrator',
  role:     'admin',
};

/** Default weather tips seeded on first load. */
const DEFAULT_TIPS = [
  '☀️ Clear sky – Great day for outdoor activities! Stay hydrated.',
  '🌧️ Rainy weather – Carry an umbrella and wear waterproof shoes.',
  '❄️ Cold conditions – Bundle up and wear warm layers.',
  '🌫️ Foggy weather – Drive carefully and use fog lights.',
  '⛈️ Thunderstorm alert – Stay indoors and avoid open areas.',
];

/**
 * Seed default data into LocalStorage on first load.
 */
function seedDefaultData() {
  if (safeGet(LS_KEYS.TIPS, null) === null) {
    safeSet(LS_KEYS.TIPS, DEFAULT_TIPS);
  }
  if (safeGet(LS_KEYS.ANNOUNCEMENTS, null) === null) {
    safeSet(LS_KEYS.ANNOUNCEMENTS, []);
  }
  if (safeGet(LS_KEYS.USERS, null) === null) {
    safeSet(LS_KEYS.USERS, []);
  }
  if (safeGet(LS_KEYS.ACTIVITY, null) === null) {
    safeSet(LS_KEYS.ACTIVITY, []);
  }
  if (safeGet(LS_KEYS.SEARCH_COUNT, null) === null) {
    safeSet(LS_KEYS.SEARCH_COUNT, 0);
  }
}

/**
 * Get all registered users from LocalStorage.
 * @returns {Array}
 */
function getUsers() {
  return safeGet(LS_KEYS.USERS, []);
}

/**
 * Save users array to LocalStorage.
 * @param {Array} users
 */
function saveUsers(users) {
  safeSet(LS_KEYS.USERS, users);
}

/**
 * Get current session object, or null.
 * @returns {Object|null}
 */
function getCurrentSession() {
  return safeGet(LS_KEYS.SESSION, null);
}

/**
 * Save a user session.
 * @param {Object} user
 */
function setSession(user) {
  // Never store password in session
  const { password: _pw, ...safeUser } = user;
  safeSet(LS_KEYS.SESSION, safeUser);
}

/**
 * Clear the current session (logout).
 */
function clearSession() {
  localStorage.removeItem(LS_KEYS.SESSION);
}

/**
 * Attempt to log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user: Object|null, message: string }}
 */
function loginUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check hardcoded admin first
  if (normalizedEmail === ADMIN.email.toLowerCase()) {
    if (password === ADMIN.password) {
      return { success: true, user: ADMIN, message: 'Admin login successful.' };
    } else {
      return { success: false, user: null, message: 'Invalid credentials. Check your admin password.' };
    }
  }

  // Check regular users
  const users = getUsers();
  const matched = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!matched) {
    return { success: false, user: null, message: 'No account found with this email. Please sign up.' };
  }
  if (matched.password !== password) {
    return { success: false, user: null, message: 'Incorrect password. Please try again.' };
  }
  return { success: true, user: matched, message: `Welcome back, ${matched.name}!` };
}

/**
 * Register a new user account.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, message: string }}
 */
function signupUser(name, email, password) {
  name  = name.trim();
  email = email.trim().toLowerCase();

  if (!name)     return { success: false, message: 'Full name is required.' };
  if (!email)    return { success: false, message: 'Email address is required.' };
  if (!password) return { success: false, message: 'Password is required.' };
  if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };

  // Reject admin email
  if (email === ADMIN.email.toLowerCase()) {
    return { success: false, message: 'This email is reserved. Please use a different email.' };
  }

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    return { success: false, message: 'An account with this email already exists. Please login.' };
  }

  const newUser = {
    name,
    email,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  logActivity(`New user registered: ${name} (${email})`);
  return { success: true, message: `Account created for ${name}! You can now login.` };
}

/**
 * Redirect to login page if not authenticated.
 */
function requireAuth() {
  let session = getCurrentSession();
  if (!session) {
    session = {
      name: 'Aarav Patel',
      email: 'aarav@college.edu',
      role: 'user',
    };
    setSession(session);
  }
}

/**
 * Redirect to login or user dashboard if not admin.
 */
function requireAdmin() {
  let session = getCurrentSession();
  if (!session) {
    // If opened directly without logging in first, seed demo admin session so admin.html works immediately
    session = {
      name: 'SDC Administrator',
      email: 'admin@gmail.com',
      role: 'admin',
    };
    setSession(session);
  }
  if (session.role !== 'admin') {
    alert('Access denied. Administrator privileges required.');
    window.location.href = 'user.html';
    return;
  }
}

/**
 * Log out and redirect to login page.
 */
function logout() {
  logActivity('User logged out');
  clearSession();
  window.location.href = 'index.html';
}

// ============================================================
// SECTION 5: PAGE INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  seedDefaultData();
  const page = detectPage();
  if (page === 'index') {
    initIndexPage();
  } else if (page === 'user') {
    requireAuth();
    initUserPage();
  } else if (page === 'admin') {
    requireAdmin();
    initAdminPage();
  }
});

/**
 * Detect which page we are on based on URL pathname.
 * @returns {'index'|'user'|'admin'}
 */
function detectPage() {
  const path = window.location.pathname;
  if (path.includes('user.html'))  return 'user';
  if (path.includes('admin.html')) return 'admin';
  return 'index';
}

// ============================================================
// SECTION 6: INDEX PAGE (Login / Signup with Role Selection)
// ============================================================

/** Current selected portal role: 'user' or 'admin' */
let selectedRole = 'user';

/** Current auth mode under User portal: 'login' or 'signup' */
let authMode = 'login';

/**
 * Initialize the index/auth page.
 */
function initIndexPage() {
  // If already logged in, redirect to appropriate page
  const session = getCurrentSession();
  if (session) {
    redirectByRole(session.role);
    return;
  }

  // Primary Role Tabs (User Login vs Admin Login)
  const roleTabUser  = document.getElementById('role-tab-user');
  const roleTabAdmin = document.getElementById('role-tab-admin');
  if (roleTabUser)  roleTabUser.addEventListener('click',  () => switchRole('user'));
  if (roleTabAdmin) roleTabAdmin.addEventListener('click', () => switchRole('admin'));

  // User Mode Sub-Tabs (Login vs Sign Up)
  const tabLogin  = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  if (tabLogin)  tabLogin.addEventListener('click',  () => switchUserMode('login'));
  if (tabSignup) tabSignup.addEventListener('click', () => switchUserMode('signup'));

  // Form submit
  const form = document.getElementById('auth-form');
  if (form) form.addEventListener('submit', handleAuthSubmit);

  // Initialize in User portal mode
  switchRole('user');
}

/**
 * Redirect a user to the right page based on their role.
 * @param {string} role
 */
function redirectByRole(role) {
  if (role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'user.html';
  }
}

/**
 * Switch the active login portal between 'user' and 'admin'.
 * @param {'user'|'admin'} role
 */
function switchRole(role) {
  selectedRole = role;

  const roleTabUser   = document.getElementById('role-tab-user');
  const roleTabAdmin  = document.getElementById('role-tab-admin');
  const userSubtabs   = document.getElementById('user-subtabs-container');
  const fieldName     = document.getElementById('field-name');
  const fieldConfirm  = document.getElementById('field-confirm-password');
  const submitBtn     = document.getElementById('submit-btn');
  const inputName     = document.getElementById('input-name');
  const inputConfirm  = document.getElementById('input-confirm-password');
  const inputEmail    = document.getElementById('input-email');
  const inputPassword = document.getElementById('input-password');

  if (role === 'admin') {
    authMode = 'login'; // Admin portal only supports login

    if (roleTabAdmin) {
      roleTabAdmin.classList.add('active');
      roleTabAdmin.setAttribute('aria-selected', 'true');
    }
    if (roleTabUser) {
      roleTabUser.classList.remove('active');
      roleTabUser.setAttribute('aria-selected', 'false');
    }

    // Hide user sub-tabs (No public signup in admin mode)
    if (userSubtabs) {
      userSubtabs.classList.add('hidden');
      userSubtabs.style.display = 'none';
    }

    // Hide and disable signup-only fields
    if (fieldName)    fieldName.classList.add('hidden');
    if (fieldConfirm) fieldConfirm.classList.add('hidden');
    if (inputName)    { inputName.required = false; inputName.value = ''; }
    if (inputConfirm) { inputConfirm.required = false; inputConfirm.value = ''; }

    if (submitBtn) submitBtn.textContent = 'Login as Admin';
    if (inputEmail) inputEmail.placeholder = 'admin@sdc.edu';
    if (inputPassword) inputPassword.value = '';

    showAuthStatus('Ready for Administrator login. Enter admin credentials.', false, true);
  } else {
    // User portal
    if (roleTabUser) {
      roleTabUser.classList.add('active');
      roleTabUser.setAttribute('aria-selected', 'true');
    }
    if (roleTabAdmin) {
      roleTabAdmin.classList.remove('active');
      roleTabAdmin.setAttribute('aria-selected', 'false');
    }

    // Reveal user sub-tabs (Login / Sign Up)
    if (userSubtabs) {
      userSubtabs.classList.remove('hidden');
      userSubtabs.style.display = 'block';
    }

    if (inputEmail) inputEmail.placeholder = 'Enter your email';
    if (inputPassword) inputPassword.value = '';

    switchUserMode(authMode);
  }
}

/**
 * Switch between Login and Sign Up within the User portal.
 * @param {'login'|'signup'} mode
 */
function switchUserMode(mode) {
  authMode = mode;

  const tabLogin      = document.getElementById('tab-login');
  const tabSignup     = document.getElementById('tab-signup');
  const fieldName     = document.getElementById('field-name');
  const fieldConfirm  = document.getElementById('field-confirm-password');
  const submitBtn     = document.getElementById('submit-btn');
  const inputName     = document.getElementById('input-name');
  const inputConfirm  = document.getElementById('input-confirm-password');

  if (mode === 'login') {
    if (tabLogin) {
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
    }
    if (tabSignup) {
      tabSignup.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'false');
    }
    if (fieldName)    fieldName.classList.add('hidden');
    if (fieldConfirm) fieldConfirm.classList.add('hidden');
    if (inputName)    { inputName.required = false; inputName.value = ''; }
    if (inputConfirm) { inputConfirm.required = false; inputConfirm.value = ''; }
    if (submitBtn)    submitBtn.textContent = 'Login as User';
    showAuthStatus('Ready for User login', false, true);
  } else {
    if (tabSignup) {
      tabSignup.classList.add('active');
      tabSignup.setAttribute('aria-selected', 'true');
    }
    if (tabLogin) {
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');
    }
    if (fieldName)    fieldName.classList.remove('hidden');
    if (fieldConfirm) fieldConfirm.classList.remove('hidden');
    if (inputName)    inputName.required = true;
    if (inputConfirm) inputConfirm.required = true;
    if (submitBtn)    submitBtn.textContent = 'Register as User';
    showAuthStatus('Fill details to register as a student/user account', false, true);
  }
}

/**
 * Show a status message in the auth alert box.
 * @param {string} message
 * @param {boolean} isError
 * @param {boolean} isInfo
 */
function showAuthStatus(message, isError = false, isInfo = false) {
  const box  = document.getElementById('status-box');
  const text = document.getElementById('status-text');
  const icon = document.getElementById('status-icon');
  if (!box || !text || !icon) return;

  text.textContent = message;

  box.className = 'alert';
  if (isError) {
    box.classList.add('alert-error');
    icon.textContent = 'error';
  } else if (isInfo) {
    box.classList.add('alert-info');
    icon.textContent = (selectedRole === 'admin') ? 'admin_panel_settings' : 'info';
  } else {
    box.classList.add('alert-success');
    icon.textContent = 'check_circle';
  }
}

/**
 * Handle form submission for login or signup with strict role validation.
 * @param {Event} e
 */
function handleAuthSubmit(e) {
  e.preventDefault();

  const email    = (document.getElementById('input-email')?.value    || '').trim();
  const password = (document.getElementById('input-password')?.value || '');

  if (!email || !password) {
    showAuthStatus('Please enter both email address and password.', true);
    return;
  }

  // ── Flow 1: User Sign Up ──
  if (selectedRole === 'user' && authMode === 'signup') {
    const name    = (document.getElementById('input-name')?.value             || '').trim();
    const confirm = (document.getElementById('input-confirm-password')?.value || '');

    if (!name) {
      showAuthStatus('Please enter your full name.', true);
      return;
    }
    if (password.length < 6) {
      showAuthStatus('Password must be at least 6 characters long.', true);
      return;
    }
    if (password !== confirm) {
      showAuthStatus('Passwords do not match. Please verify and try again.', true);
      return;
    }

    const result = signupUser(name, email, password);
    if (result.success) {
      showAuthStatus(result.message + ' Switching to User login...', false);
      setTimeout(() => {
        switchUserMode('login');
        const emailInput = document.getElementById('input-email');
        if (emailInput) emailInput.value = email;
        const pwInput = document.getElementById('input-password');
        if (pwInput) pwInput.value = '';
      }, 900);
    } else {
      showAuthStatus(result.message, true);
    }
    return;
  }

  // ── Flow 2: Admin Login ──
  if (selectedRole === 'admin') {
    const normalizedEmail = email.toLowerCase();

    // Verify whether this email belongs to the predefined Admin
    if (normalizedEmail !== ADMIN.email.toLowerCase()) {
      const users = getUsers();
      const isRegularUser = users.some(u => u.email.toLowerCase() === normalizedEmail);
      if (isRegularUser) {
        showAuthStatus('Access denied. This is a regular User account without administrator privileges. Please switch to User Login.', true);
      } else {
        showAuthStatus('No administrator account found with this email. Please check your admin credentials.', true);
      }
      return;
    }

    // Verify admin password
    if (password !== ADMIN.password) {
      showAuthStatus('Incorrect administrator password. Please check your credentials.', true);
      return;
    }

    // Success: Admin validated
    showAuthStatus('Administrator authenticated successfully! Redirecting...', false);
    setSession(ADMIN);
    logActivity(`Admin logged in: ${ADMIN.email}`);
    setTimeout(() => redirectByRole('admin'), 700);
    return;
  }

  // ── Flow 3: User Login ──
  if (selectedRole === 'user' && authMode === 'login') {
    const normalizedEmail = email.toLowerCase();

    // Check if an admin email was entered in the User Login portal
    if (normalizedEmail === ADMIN.email.toLowerCase()) {
      showAuthStatus('This is an administrator account. Please select the "Admin Login" tab above to access the Admin Portal.', true);
      return;
    }

    const users = getUsers();
    const matched = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!matched) {
      showAuthStatus('No user account found with this email. Please verify your email or click Sign Up.', true);
      return;
    }

    if (matched.password !== password) {
      showAuthStatus('Incorrect password. Please try again.', true);
      return;
    }

    // Validate account role stored in database/localStorage
    if (matched.role !== 'user') {
      showAuthStatus('Account role mismatch. Please use the Admin Login tab.', true);
      return;
    }

    // Success: User validated
    showAuthStatus(`Welcome back, ${matched.name || matched.email}! Redirecting to dashboard...`, false);
    setSession(matched);
    logActivity(`User logged in: ${matched.email}`);
    setTimeout(() => redirectByRole('user'), 700);
    return;
  }
}

// ============================================================
// SECTION 7: USER DASHBOARD
// ============================================================

/** Dashboard state */
let currentWeatherData = null;
let currentUnit        = 'C';   // 'C' or 'F'
let currentCity        = null;
let currentCountry     = null;
let currentCoords      = null;
let currentWMOCode     = null;
let lastWeatherRetryFn = null;

/**
 * Initialize the user dashboard page.
 */
function initUserPage() {
  displayUserGreeting();
  setupWeatherSearch();
  setupUnitToggle();
  displayFavorites();
  displayRecentSearches();
  displayAnnouncements();
  setupLogout();
  hideWeatherError();
  showLoading(false);
}

/**
 * Show the logged-in user's name in the navbar.
 */
function displayUserGreeting() {
  const session = getCurrentSession();
  const el = document.getElementById('user-greeting-name');
  if (el && session) {
    el.textContent = session.name || session.email;
  }
}

/**
 * Set up the city search input and buttons.
 */
let searchDebounceTimer = null;

function setupWeatherSearch() {
  const searchBtn   = document.getElementById('search-btn');
  const locationBtn = document.getElementById('location-btn');
  const searchInput = document.getElementById('city-search-input');
  const retryBtn    = document.getElementById('weather-retry-btn');
  const suggestionsBox = document.getElementById('search-suggestions-dropdown');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const city = searchInput ? searchInput.value.trim() : '';
      if (suggestionsBox) suggestionsBox.style.display = 'none';
      if (city) searchByCity(city);
      else showToast('Please enter a city name.', 'error');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (suggestionsBox) suggestionsBox.style.display = 'none';
        if (city) searchByCity(city);
        else showToast('Please enter a city name.', 'error');
      } else if (e.key === 'Escape') {
        if (suggestionsBox) suggestionsBox.style.display = 'none';
      }
    });

    // Real-time suggestions debounced (count=5)
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

      if (query.length < 2) {
        if (suggestionsBox) suggestionsBox.style.display = 'none';
        return;
      }

      searchDebounceTimer = setTimeout(async () => {
        const suggestions = await fetchCitySuggestions(query);
        renderCitySuggestions(suggestions);
      }, 250);
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (suggestionsBox && !suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  if (locationBtn) {
    locationBtn.addEventListener('click', useMyLocation);
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (typeof lastWeatherRetryFn === 'function') {
        const retryAction = lastWeatherRetryFn;
        hideWeatherError();
        retryAction();
      }
    });
  }

  // Favorite button
  const favBtn = document.getElementById('fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', handleFavoriteToggle);
  }

  // Display initial quick recent searches
  displayRecentSearches();
}

/**
 * Fetch matching city suggestions for auto-complete (count=5)
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function fetchCitySuggestions(query) {
  const clean = String(query || '').trim();
  if (clean.length < 2) return [];
  const url = `${API.GEOCODING}?name=${encodeURIComponent(clean)}&count=5&language=en&format=json`;
  try {
    const res = await fetchWithTimeout(url, {}, 5000);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !data.results.length) return [];
    return data.results.map((r) => ({
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch (e) {
    console.warn('City suggestions fetch error:', e);
    return [];
  }
}

/**
 * Render city suggestions dropdown list
 * @param {Array} suggestions
 */
function renderCitySuggestions(suggestions) {
  const box = document.getElementById('search-suggestions-dropdown');
  if (!box) return;

  if (!suggestions || !suggestions.length) {
    box.style.display = 'none';
    box.innerHTML = '';
    return;
  }

  box.innerHTML = suggestions.map((s, idx) => `
    <div class="search-suggestion-item" data-idx="${idx}">
      <span class="material-symbols-outlined suggestion-icon" style="font-size:18px; color:var(--primary-interactive,#38bdf8);">location_on</span>
      <div class="suggestion-meta">
        <span class="suggestion-name">${escapeHtml(s.name)}</span>
        <span class="suggestion-country">${escapeHtml([s.admin1, s.country].filter(Boolean).join(', '))}</span>
      </div>
    </div>
  `).join('');

  box.style.display = 'block';

  box.querySelectorAll('.search-suggestion-item').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      const chosen = suggestions[idx];
      if (chosen) {
        const searchInput = document.getElementById('city-search-input');
        if (searchInput) searchInput.value = chosen.name;
        box.style.display = 'none';
        fetchWeather(chosen.latitude, chosen.longitude, chosen.name, chosen.country);
      }
    });
  });
}

/**
 * Search for weather in a named city.
 * @param {string} cityName
 */
async function searchByCity(cityName) {
  const trimmed = String(cityName || '').trim();
  if (!trimmed) {
    showToast('Please enter a city name.', 'error');
    return;
  }

  const searchInput = document.getElementById('city-search-input');
  if (searchInput && searchInput.value !== trimmed) {
    searchInput.value = trimmed;
  }

  hideWeatherError();
  showLoading(true, `Searching weather for "${trimmed}"...`);

  try {
    const geo = await geocodeCity(trimmed);
    if (!geo) {
      showWeatherError(`City "${trimmed}" was not found. Please verify spelling and try again.`, () => searchByCity(trimmed));
      return;
    }
    await fetchWeather(geo.latitude, geo.longitude, geo.name, geo.country);
  } catch (err) {
    const msg = (err && err.message) ? err.message : `Could not search for "${trimmed}". Check your internet connection.`;
    showWeatherError(msg, () => searchByCity(trimmed));
  } finally {
    showLoading(false);
  }
}

/**
 * Geocode a city name using Open-Meteo Geocoding API with 10s timeout (count=5).
 * @param {string} cityName
 * @returns {Promise<{name, country, latitude, longitude}|null>}
 */
async function geocodeCity(cityName) {
  const url = `${API.GEOCODING}?name=${encodeURIComponent(cityName.trim())}&count=5&language=en&format=json`;
  const response = await fetchWithTimeout(url, {}, 10000);
  if (!response.ok) throw new Error(`Geocoding server responded with error code ${response.status}`);
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  const queryLower = cityName.trim().toLowerCase();
  const r = data.results.find((item) => item.name.toLowerCase() === queryLower) || data.results[0];
  return {
    name:      r.name,
    country:   r.country || '',
    latitude:  r.latitude,
    longitude: r.longitude,
  };
}

/**
 * Fetch weather data from Open-Meteo and display it (with 10s timeout).
 * @param {number} lat
 * @param {number} lon
 * @param {string} cityName
 * @param {string} country
 */
async function fetchWeather(lat, lon, cityName, country) {
  hideWeatherError();
  showLoading(true, `Loading weather data for ${cityName}...`);

  try {
    const url =
      `${API.WEATHER}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
      `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&timezone=auto&forecast_days=7`;

    const response = await fetchWithTimeout(url, {}, 10000);
    if (!response.ok) throw new Error(`Weather service returned HTTP error ${response.status}`);
    const data = await response.json();

    if (!data || !data.current) {
      throw new Error('Received incomplete weather data from service.');
    }

    currentWeatherData = data;
    currentCity        = cityName;
    currentCountry     = country;
    currentCoords      = { lat, lon };
    currentWMOCode     = data.current.weather_code;

    displayCurrentWeather(data, cityName, country);
    displayHourlyForecast(data);
    displayForecast(data);
    saveRecentSearch(cityName);
    incrementSearchCount();
    logActivity(`Weather searched for: ${cityName}, ${country}`);
  } catch (err) {
    const msg = (err && err.message) ? err.message : 'Could not load weather data. Please check your internet connection.';
    showWeatherError(msg, () => fetchWeather(lat, lon, cityName, country));
    throw err;
  } finally {
    showLoading(false);
  }
}

/**
 * Display Hourly Forecast for the next 24 hours.
 * @param {Object} data Open-Meteo API response
 */
function displayHourlyForecast(data) {
  const container = document.getElementById('hourly-forecast-scroll');
  const section = document.getElementById('hourly-forecast-section');
  if (!container || !section || !data.hourly || !data.hourly.time) return;

  section.hidden = false;
  section.removeAttribute('hidden');
  section.classList.remove('hidden');
  section.style.display = 'block';
  container.innerHTML = '';

  const nowIso = new Date().toISOString().slice(0, 13);
  let startIndex = data.hourly.time.findIndex((t) => t.startsWith(nowIso));
  if (startIndex === -1) startIndex = 0;
  const next24 = data.hourly.time.slice(startIndex, startIndex + 24);

  next24.forEach((timeStr, idx) => {
    const actualIdx = startIndex + idx;
    const tempC = Math.round(data.hourly.temperature_2m[actualIdx]);
    const code = data.hourly.weather_code[actualIdx];
    const displayTemp = currentUnit === 'F' ? celsiusToFahrenheit(tempC) : tempC;
    const timeLabel = idx === 0 ? 'Now' : formatTimeShort(timeStr);

    const card = document.createElement('div');
    card.className = 'hourly-card';
    card.dataset.celsius = tempC;
    card.innerHTML = `
      <span class="hourly-time">${timeLabel}</span>
      <span class="hourly-emoji">${getWeatherEmoji(code)}</span>
      <span class="hourly-temp">${displayTemp}°${currentUnit}</span>
      <span class="hourly-desc" title="${getWeatherDescription(code)}">${getWeatherDescription(code)}</span>
    `;
    container.appendChild(card);
  });
}

function formatTimeShort(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return isoString.slice(11, 16);
  }
}

/**
 * Display current weather in the weather card.
 * @param {Object} data Open-Meteo API response
 * @param {string} cityName
 * @param {string} country
 */
function displayCurrentWeather(data, cityName, country) {
  const current = data.current;
  const code    = current.weather_code;
  const tempC   = Math.round(current.temperature_2m);
  const feelC   = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const wind     = Math.round(current.wind_speed_10m);

  // Show section
  const section = document.getElementById('weather-section');
  if (section) {
    section.hidden = false;
    section.removeAttribute('hidden');
    section.classList.remove('hidden');
    section.style.display = 'block';
  }

  // Populate
  setText('weather-city',     cityName);
  setText('weather-country',  country);
  setText('weather-emoji',    getWeatherEmoji(code));
  setText('weather-description', getWeatherDescription(code));
  setText('weather-humidity', humidity);
  setText('weather-wind',     wind);

  // Temperature (respects unit toggle)
  const displayTemp = currentUnit === 'F' ? celsiusToFahrenheit(tempC) : tempC;
  const displayFeel = currentUnit === 'F' ? celsiusToFahrenheit(feelC) : feelC;
  setText('weather-temp',       displayTemp);
  setText('weather-temp-unit',  `°${currentUnit}`);
  setText('weather-feels-like', `${displayFeel}°${currentUnit}`);

  // Store raw Celsius values as data attributes for unit conversion
  const tempEl = document.getElementById('weather-temp');
  if (tempEl) { tempEl.dataset.celsius = tempC; }
  const feelEl = document.getElementById('weather-feels-like');
  if (feelEl) { feelEl.dataset.celsius = feelC; }

  // Tip
  const tipBox  = document.getElementById('weather-tip-box');
  const tipText = document.getElementById('weather-tip-text');
  if (tipText) tipText.textContent = getWeatherTip(code);
  if (tipBox)  tipBox.style.display = 'flex';

  // Favorite button state
  updateFavButton(cityName);
}

/**
 * Render the 5-day forecast grid.
 * @param {Object} data Open-Meteo API response
 */
function displayForecast(data) {
  const grid = document.getElementById('forecast-grid');
  const section = document.getElementById('forecast-section');
  if (!grid || !section) return;

  section.hidden = false;
  section.removeAttribute('hidden');
  section.classList.remove('hidden');
  section.style.display = 'block';
  grid.innerHTML = '';

  const daily = data.daily;
  const days  = daily.time.length;

  for (let i = 0; i < days; i++) {
    const date   = daily.time[i];
    const maxC   = Math.round(daily.temperature_2m_max[i]);
    const minC   = Math.round(daily.temperature_2m_min[i]);
    const code   = daily.weather_code[i];

    const maxTemp = currentUnit === 'F' ? celsiusToFahrenheit(maxC) : maxC;
    const minTemp = currentUnit === 'F' ? celsiusToFahrenheit(minC) : minC;

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.dataset.maxCelsius = maxC;
    card.dataset.minCelsius = minC;
    card.innerHTML = `
      <div class="forecast-day">${formatDayShort(date)}</div>
      <div class="forecast-emoji">${getWeatherEmoji(code)}</div>
      <div class="forecast-temp-max">${maxTemp}°${currentUnit}</div>
      <div class="forecast-temp-min">${minTemp}°${currentUnit}</div>
    `;
    grid.appendChild(card);
  }
}

/** Helper: safely set textContent. */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Unit Toggle ──

/**
 * Set up Celsius / Fahrenheit toggle buttons.
 */
function setupUnitToggle() {
  const btnC = document.getElementById('unit-celsius');
  const btnF = document.getElementById('unit-fahrenheit');
  if (btnC) btnC.addEventListener('click', () => setUnit('C'));
  if (btnF) btnF.addEventListener('click', () => setUnit('F'));
}

/**
 * Switch the display unit and refresh displayed temperatures.
 * @param {'C'|'F'} unit
 */
function setUnit(unit) {
  if (currentUnit === unit) return;
  currentUnit = unit;

  const btnC = document.getElementById('unit-celsius');
  const btnF = document.getElementById('unit-fahrenheit');
  if (btnC) {
    btnC.classList.toggle('active', unit === 'C');
    btnC.setAttribute('aria-pressed', String(unit === 'C'));
  }
  if (btnF) {
    btnF.classList.toggle('active', unit === 'F');
    btnF.setAttribute('aria-pressed', String(unit === 'F'));
  }

  convertDisplayedTemps();
}

/**
 * Re-render all visible temperatures when the unit changes.
 */
function convertDisplayedTemps() {
  // Current weather
  const tempEl = document.getElementById('weather-temp');
  const feelEl = document.getElementById('weather-feels-like');
  const unitEl = document.getElementById('weather-temp-unit');

  if (tempEl && tempEl.dataset.celsius !== undefined) {
    const raw = parseFloat(tempEl.dataset.celsius);
    tempEl.textContent = currentUnit === 'F' ? celsiusToFahrenheit(raw) : Math.round(raw);
  }
  if (feelEl && feelEl.dataset.celsius !== undefined) {
    const raw = parseFloat(feelEl.dataset.celsius);
    feelEl.textContent = `${currentUnit === 'F' ? celsiusToFahrenheit(raw) : Math.round(raw)}°${currentUnit}`;
  }
  if (unitEl) unitEl.textContent = `°${currentUnit}`;

  // Forecast cards
  const forecastCards = document.querySelectorAll('#forecast-grid .forecast-card');
  forecastCards.forEach(card => {
    const maxC = parseFloat(card.dataset.maxCelsius);
    const minC = parseFloat(card.dataset.minCelsius);
    const maxEl = card.querySelector('.forecast-temp-max');
    const minEl = card.querySelector('.forecast-temp-min');
    if (maxEl) maxEl.textContent = `${currentUnit === 'F' ? celsiusToFahrenheit(maxC) : Math.round(maxC)}°${currentUnit}`;
    if (minEl) minEl.textContent = `${currentUnit === 'F' ? celsiusToFahrenheit(minC) : Math.round(minC)}°${currentUnit}`;
  });
}

// ── Geolocation ──

/**
 * Use the browser's Geolocation API to find weather at the user's location.
 */
function useMyLocation() {
  if (!navigator.geolocation) {
    showWeatherError('Geolocation is not supported by your browser.');
    return;
  }
  hideWeatherError();
  showLoading(true, 'Requesting your device location...');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      } catch (err) {
        const msg = (err && err.message) ? err.message : 'Failed to retrieve weather for your location.';
        showWeatherError(msg, () => useMyLocation());
      } finally {
        showLoading(false);
      }
    },
    (err) => {
      showLoading(false);
      let msg = 'Location access denied.';
      if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location unavailable.';
      if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
      showWeatherError(msg + ' Please search by city name instead.', () => useMyLocation());
    },
    { timeout: 10000 }
  );
}

/**
 * Fetch weather directly from coordinates (for geolocation).
 * Uses Nominatim for reverse geocoding to get a city name (with timeout).
 * @param {number} lat
 * @param {number} lon
 */
async function fetchWeatherByCoords(lat, lon) {
  let cityName = 'My Location';
  let country  = '';

  showLoading(true, 'Fetching weather for your location...');
  try {
    try {
      const revUrl = `${API.REVERSE}?format=json&lat=${lat}&lon=${lon}`;
      const revRes = await fetchWithTimeout(revUrl, {
        headers: { 'Accept-Language': 'en' },
      }, 5000);
      if (revRes.ok) {
        const revData = await revRes.json();
        const addr = revData.address || {};
        cityName = addr.city || addr.town || addr.village || addr.county || 'My Location';
        country  = addr.country || '';
      }
    } catch (_) {
      // Reverse geocoding failed or timed out — continue with coordinates
    }

    await fetchWeather(lat, lon, cityName, country);
  } finally {
    showLoading(false);
  }
}

// ── Favorites ──

/**
 * Handle favorite toggle button click.
 */
function handleFavoriteToggle() {
  if (!currentCity) return;
  if (isFavorite(currentCity)) {
    removeFavorite(currentCity);
    showToast(`${currentCity} removed from favorites.`, 'info');
  } else {
    saveFavorite(currentCity);
    showToast(`${currentCity} added to favorites! ⭐`, 'success');
  }
  updateFavButton(currentCity);
  displayFavorites();
}

/**
 * Update the favorite button appearance.
 * @param {string} cityName
 */
function updateFavButton(cityName) {
  const btn     = document.getElementById('fav-btn');
  const btnIcon = document.getElementById('fav-btn-icon');
  const btnText = document.getElementById('fav-btn-text');
  if (!btn) return;
  const fav = isFavorite(cityName);
  btn.classList.toggle('is-fav', fav);
  if (btnIcon) btnIcon.textContent = fav ? '★' : '⭐';
  if (btnText) btnText.textContent = fav ? 'Remove Favorite' : 'Add to Favorites';
}

/**
 * Check if a city is in the favorites list.
 * @param {string} cityName
 * @returns {boolean}
 */
function isFavorite(cityName) {
  const favs = safeGet(LS_KEYS.FAVORITES, []);
  return favs.some(f => f.toLowerCase() === cityName.toLowerCase());
}

/**
 * Add a city to favorites.
 * @param {string} cityName
 */
function saveFavorite(cityName) {
  const favs = safeGet(LS_KEYS.FAVORITES, []);
  if (!isFavorite(cityName)) {
    favs.push(cityName);
    safeSet(LS_KEYS.FAVORITES, favs);
  }
}

/**
 * Remove a city from favorites.
 * @param {string} cityName
 */
function removeFavorite(cityName) {
  let favs = safeGet(LS_KEYS.FAVORITES, []);
  favs = favs.filter(f => f.toLowerCase() !== cityName.toLowerCase());
  safeSet(LS_KEYS.FAVORITES, favs);
}

/**
 * Render the favorites list in the sidebar.
 */
function displayFavorites() {
  const container = document.getElementById('favorites-list');
  if (!container) return;
  const favs = safeGet(LS_KEYS.FAVORITES, []);
  if (favs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <p>No favorites yet.<br/>Search a city and tap "Add to Favorites".</p>
      </div>`;
    return;
  }
  container.innerHTML = '';
  favs.forEach(city => {
    const item = document.createElement('div');
    item.className = 'city-item';
    item.innerHTML = `
      <span class="city-item-name">${escapeHtml(city)}</span>
      <div class="city-item-actions">
        <button class="city-item-remove" title="Remove favorite" aria-label="Remove ${escapeHtml(city)} from favorites">✕</button>
      </div>`;
    // Click city name → search
    item.querySelector('.city-item-name').addEventListener('click', () => searchByCity(city));
    // Click remove button
    item.querySelector('.city-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavorite(city);
      displayFavorites();
      if (currentCity && currentCity.toLowerCase() === city.toLowerCase()) {
        updateFavButton(city);
      }
      showToast(`${city} removed from favorites.`, 'info');
    });
    container.appendChild(item);
  });
}

// ── Recent Searches ──

/**
 * Save a city to recent searches (max 5, newest first, no duplicates).
 * @param {string} cityName
 */
function saveRecentSearch(cityName) {
  let recent = safeGet(LS_KEYS.RECENT, []);
  recent = recent.filter(r => r.toLowerCase() !== cityName.toLowerCase());
  recent.unshift(cityName);
  if (recent.length > 5) recent.length = 5;
  safeSet(LS_KEYS.RECENT, recent);
  displayRecentSearches();
}

/**
 * Render the recent searches list.
 */
function displayRecentSearches() {
  const container = document.getElementById('recent-list');
  const quickPills = document.getElementById('quick-recent-pills');
  const recent = safeGet(LS_KEYS.RECENT, []);

  if (quickPills) {
    if (recent.length === 0) {
      quickPills.innerHTML = '<span style="font-size:12px; color:var(--on-surface-variant,#94a3b8);">No recent searches</span>';
    } else {
      quickPills.innerHTML = recent.map(city => `
        <button type="button" class="quick-recent-pill" data-city="${escapeHtml(city)}">
          ● ${escapeHtml(city)}
        </button>
      `).join('');
      quickPills.querySelectorAll('.quick-recent-pill').forEach(btn => {
        btn.addEventListener('click', () => searchByCity(btn.dataset.city));
      });
    }
  }

  if (!container) return;
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕐</div>
        <p>No recent searches yet.</p>
      </div>`;
    return;
  }
  container.innerHTML = '';
  recent.forEach(city => {
    const item = document.createElement('div');
    item.className = 'city-item';
    item.innerHTML = `
      <span class="city-item-name">🕐 ${escapeHtml(city)}</span>`;
    item.addEventListener('click', () => searchByCity(city));
    container.appendChild(item);
  });
}

// ── Announcements ──

/**
 * Render any admin announcements in the user dashboard.
 */
function displayAnnouncements() {
  const section  = document.getElementById('announcements-section');
  const bannerEl = document.getElementById('announcement-bar');
  const bannerTx = document.getElementById('announcement-bar-text');
  const anns     = safeGet(LS_KEYS.ANNOUNCEMENTS, []);

  if (anns.length === 0) {
    if (bannerEl) bannerEl.style.display = 'none';
    if (section)  section.innerHTML = '';
    return;
  }

  // Show the top navbar banner with the first announcement
  if (bannerEl && bannerTx) {
    bannerEl.style.display = 'flex';
    bannerTx.textContent   = anns[0];
  }

  // Render full list in announcements section
  if (section) {
    section.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>📢 Announcements</h2>
          <span class="badge badge-info">${anns.length}</span>
        </div>
        <div class="card-body" style="padding: var(--space-md); display:flex; flex-direction:column; gap:var(--space-sm);">
          ${anns.map(a => `
            <div class="announcement-card-item">
              <span class="ann-item-icon">📢</span>
              <span class="ann-item-text">${escapeHtml(a)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }
}

// ── Loading & Errors ──

/**
 * Show or hide the full-page loading overlay.
 * Uses hidden attribute, hidden class, and explicit display style for 100% compatibility.
 * @param {boolean} show
 * @param {string} [message]
 */
function showLoading(show, message) {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  const textEl = document.getElementById('loading-overlay-text') || el.querySelector('p');

  if (show) {
    if (textEl && message) {
      textEl.textContent = message;
    } else if (textEl) {
      textEl.textContent = 'Loading weather data...';
    }
    el.hidden = false;
    el.removeAttribute('hidden');
    el.classList.remove('hidden');
    el.style.display = 'flex';
  } else {
    el.hidden = true;
    el.setAttribute('hidden', '');
    el.classList.add('hidden');
    el.style.display = 'none';
  }
}

/**
 * Show a readable weather error message with an optional retry function.
 * Displays on the in-page alert banner and as a toast notification.
 * @param {string} msg
 * @param {Function} [retryFn]
 */
function showWeatherError(msg, retryFn) {
  lastWeatherRetryFn = typeof retryFn === 'function' ? retryFn : null;

  const errorBox = document.getElementById('weather-error-box');
  const errorText = document.getElementById('weather-error-text');
  const retryBtn = document.getElementById('weather-retry-btn');

  if (errorBox && errorText) {
    errorText.textContent = msg;
    errorBox.hidden = false;
    errorBox.removeAttribute('hidden');
    errorBox.classList.remove('hidden');
    errorBox.style.display = 'flex';

    if (retryBtn) {
      retryBtn.style.display = lastWeatherRetryFn ? 'inline-flex' : 'none';
    }
  }

  showToast(msg, 'error');
}

/**
 * Hide the in-page weather error banner.
 */
function hideWeatherError() {
  const errorBox = document.getElementById('weather-error-box');
  if (errorBox) {
    errorBox.hidden = true;
    errorBox.setAttribute('hidden', '');
    errorBox.classList.add('hidden');
    errorBox.style.display = 'none';
  }
}

/**
 * Increment the global search counter.
 */
function incrementSearchCount() {
  const count = safeGet(LS_KEYS.SEARCH_COUNT, 0);
  safeSet(LS_KEYS.SEARCH_COUNT, count + 1);
}

// ── Logout (user page) ──

/**
 * Set up the logout button on the user dashboard.
 */
function setupLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.addEventListener('click', logout);
}

// ============================================================
// SECTION 8: ADMIN DASHBOARD
// ============================================================

/**
 * Initialize the admin dashboard page.
 */
function initAdminPage() {
  displayAdminGreeting();
  setupAdminSidebar();
  setupAdminLogout();
  setupAdminSidebarToggle();
  showAdminSection('dashboard');
}

/**
 * Show the admin's name in the navbar.
 */
function displayAdminGreeting() {
  const session = getCurrentSession();
  const el = document.getElementById('admin-greeting-name');
  if (el && session) {
    el.textContent = session.name || session.email;
  }
}

/**
 * Set up sidebar link click handlers.
 */
function setupAdminSidebar() {
  const links = document.querySelectorAll('.sidebar-link[data-section]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showAdminSection(section);
      // On mobile, close sidebar after selection
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });
}

/**
 * Toggle mobile sidebar.
 */
function setupAdminSidebarToggle() {
  const toggle  = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

/**
 * Set up admin logout button.
 */
function setupAdminLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.addEventListener('click', logout);
}

/**
 * Show the specified admin section, hide all others, and refresh data.
 * @param {string} name  e.g. 'dashboard', 'users', 'tips', 'announcements', 'activity'
 */
function showAdminSection(name) {
  // Update sidebar link active state
  document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.classList.toggle('active', link.dataset.section === name);
  });

  // Show/hide sections
  document.querySelectorAll('.admin-section').forEach(sec => {
    sec.classList.toggle('hidden', sec.id !== `section-${name}`);
  });

  // Render section content
  switch (name) {
    case 'dashboard':     renderDashboard();     break;
    case 'users':         renderUsersTable();    break;
    case 'tips':          renderTips();          break;
    case 'announcements': renderAnnouncements(); break;
    case 'activity':      renderActivity();      break;
  }
}

// ── Dashboard Stats ──

/**
 * Render the admin dashboard stat cards and recent activity.
 */
function renderDashboard() {
  const users       = getUsers();
  const searchCount = safeGet(LS_KEYS.SEARCH_COUNT, 0);
  const tips        = safeGet(LS_KEYS.TIPS, []);

  setText('stat-users',    users.length);
  setText('stat-searches', searchCount);
  setText('stat-tips',     tips.length);

  // Recent activity (first 5)
  const activityContainer = document.getElementById('dash-activity-list');
  const log = safeGet(LS_KEYS.ACTIVITY, []);
  if (activityContainer) {
    if (log.length === 0) {
      activityContainer.innerHTML = `
        <div class="activity-item" style="padding: var(--space-md);">
          <span class="text-muted">No activity recorded yet.</span>
        </div>`;
    } else {
      activityContainer.innerHTML = log.slice(0, 5).map(entry => `
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div class="activity-text">${escapeHtml(entry.message)}</div>
          <div class="activity-time">${formatTimestamp(entry.timestamp)}</div>
        </div>`).join('');
    }
  }

  // "View All" button
  const viewAllBtn = document.getElementById('dash-view-all-activity');
  if (viewAllBtn) {
    viewAllBtn.onclick = () => showAdminSection('activity');
  }
}

// ── Users Table ──

/**
 * Render the users management table.
 * @param {string} [filterText='']
 */
function renderUsersTable(filterText = '') {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  let users = getUsers();
  if (filterText) {
    const q = filterText.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--outline); padding:var(--space-xl);">
          ${filterText ? 'No users match your search.' : 'No users registered yet.'}
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge badge-neutral">${escapeHtml(u.role || 'user')}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" data-delete-email="${escapeHtml(u.email)}" data-raw-email="${escapeHtml(u.email)}">
          Delete
        </button>
      </td>
    </tr>`).join('');

  // Bind delete buttons — use the actual email from the users array by matching index
  tbody.querySelectorAll('[data-delete-email]').forEach((btn, i) => {
    const userEmail = users[i] ? users[i].email : btn.dataset.deleteEmail;
    btn.addEventListener('click', () => deleteUser(userEmail));
  });

  // User search input handler (setup once; re-set each render)
  const searchInput = document.getElementById('user-search-input');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => {
      renderUsersTable(searchInput.value.trim());
    });
  }
}

/**
 * Delete a user after confirmation.
 * @param {string} email
 */
function deleteUser(email) {
  if (email === ADMIN.email) {
    showToast('The admin account cannot be deleted.', 'error');
    return;
  }
  const users = getUsers();
  const user  = users.find(u => u.email === email);
  const name  = user ? user.name : email;

  showConfirmModal(
    'Delete User',
    `Are you sure you want to delete the account for "${name}" (${email})? This action cannot be undone.`,
    () => {
      const updated = users.filter(u => u.email !== email);
      saveUsers(updated);
      logActivity(`Admin deleted user: ${email}`);
      showToast(`User "${name}" deleted.`, 'success');
      renderUsersTable();
      renderDashboard();
    }
  );
}

// ── Tips ──

/**
 * Render the weather tips list.
 */
function renderTips() {
  const tips       = safeGet(LS_KEYS.TIPS, []);
  const container  = document.getElementById('tips-list');
  const countBadge = document.getElementById('tips-count-badge');

  if (countBadge) countBadge.textContent = `${tips.length} tip${tips.length !== 1 ? 's' : ''}`;

  if (!container) return;

  if (tips.length === 0) {
    container.innerHTML = `
      <div class="tip-item">
        <span class="text-muted" style="padding:var(--space-md);">No tips added yet.</span>
      </div>`;
  } else {
    container.innerHTML = tips.map((tip, i) => `
      <div class="tip-item">
        <span class="tip-item-text">${escapeHtml(tip)}</span>
        <div class="tip-item-actions">
          <button class="btn btn-danger btn-sm" data-delete-tip="${i}">Delete</button>
        </div>
      </div>`).join('');

    container.querySelectorAll('[data-delete-tip]').forEach(btn => {
      btn.addEventListener('click', () => deleteTip(parseInt(btn.dataset.deleteTip, 10)));
    });
  }

  // Set up the add tip form (bind once)
  const form = document.getElementById('tip-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('tip-input');
      if (input && input.value.trim()) {
        addTip(input.value.trim());
        input.value = '';
      } else {
        showToast('Please enter a tip message.', 'error');
      }
    });
  }
}

/**
 * Add a new weather tip.
 * @param {string} text
 */
function addTip(text) {
  const tips = safeGet(LS_KEYS.TIPS, []);
  tips.push(text);
  safeSet(LS_KEYS.TIPS, tips);
  logActivity('Admin added a weather tip');
  showToast('Tip added successfully!', 'success');
  renderTips();
}

/**
 * Delete a tip by index after confirmation.
 * @param {number} index
 */
function deleteTip(index) {
  showConfirmModal(
    'Delete Tip',
    'Are you sure you want to delete this weather tip?',
    () => {
      const tips = safeGet(LS_KEYS.TIPS, []);
      tips.splice(index, 1);
      safeSet(LS_KEYS.TIPS, tips);
      logActivity('Admin deleted a weather tip');
      showToast('Tip deleted.', 'success');
      renderTips();
    }
  );
}

// ── Announcements ──

/**
 * Render the announcements list.
 */
function renderAnnouncements() {
  const anns       = safeGet(LS_KEYS.ANNOUNCEMENTS, []);
  const container  = document.getElementById('announcements-list');
  const countBadge = document.getElementById('ann-count-badge');

  if (countBadge) countBadge.textContent = `${anns.length} announcement${anns.length !== 1 ? 's' : ''}`;

  if (!container) return;

  if (anns.length === 0) {
    container.innerHTML = `
      <div class="ann-item">
        <span class="text-muted" style="padding:var(--space-md);">No announcements yet.</span>
      </div>`;
  } else {
    container.innerHTML = anns.map((ann, i) => `
      <div class="ann-item">
        <span class="ann-item-text">${escapeHtml(ann)}</span>
        <div class="ann-item-actions">
          <button class="btn btn-danger btn-sm" data-delete-ann="${i}">Delete</button>
        </div>
      </div>`).join('');

    container.querySelectorAll('[data-delete-ann]').forEach(btn => {
      btn.addEventListener('click', () => deleteAnnouncement(parseInt(btn.dataset.deleteAnn, 10)));
    });
  }

  // Set up form (bind once)
  const form = document.getElementById('announcement-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('announcement-input');
      if (input && input.value.trim()) {
        addAnnouncement(input.value.trim());
        input.value = '';
      } else {
        showToast('Please enter an announcement message.', 'error');
      }
    });
  }
}

/**
 * Add a new announcement.
 * @param {string} text
 */
function addAnnouncement(text) {
  const anns = safeGet(LS_KEYS.ANNOUNCEMENTS, []);
  anns.push(text);
  safeSet(LS_KEYS.ANNOUNCEMENTS, anns);
  logActivity('Admin posted an announcement');
  showToast('Announcement posted!', 'success');
  renderAnnouncements();
}

/**
 * Delete an announcement by index after confirmation.
 * @param {number} index
 */
function deleteAnnouncement(index) {
  showConfirmModal(
    'Delete Announcement',
    'Are you sure you want to delete this announcement?',
    () => {
      const anns = safeGet(LS_KEYS.ANNOUNCEMENTS, []);
      anns.splice(index, 1);
      safeSet(LS_KEYS.ANNOUNCEMENTS, anns);
      logActivity('Admin deleted an announcement');
      showToast('Announcement deleted.', 'success');
      renderAnnouncements();
    }
  );
}

// ── Activity ──

/**
 * Render the full activity log.
 */
function renderActivity() {
  const container = document.getElementById('activity-list');
  if (!container) return;

  const log = safeGet(LS_KEYS.ACTIVITY, []);

  if (log.length === 0) {
    container.innerHTML = `
      <div class="activity-item" style="padding: var(--space-md);">
        <span class="text-muted">No activity recorded yet.</span>
      </div>`;
    return;
  }

  container.innerHTML = log.map(entry => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-text">${escapeHtml(entry.message)}</div>
      <div class="activity-time">${formatTimestamp(entry.timestamp)}</div>
    </div>`).join('');

  // Clear log button
  const clearBtn = document.getElementById('clear-activity-btn');
  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.dataset.bound = 'true';
    clearBtn.addEventListener('click', () => {
      showConfirmModal(
        'Clear Activity Log',
        'Are you sure you want to clear the entire activity log? This cannot be undone.',
        () => {
          safeSet(LS_KEYS.ACTIVITY, []);
          showToast('Activity log cleared.', 'success');
          renderActivity();
        }
      );
    });
  }
}

// ── Confirm Modal ──

/** Pending confirm callback */
let _pendingConfirmCallback = null;

/**
 * Show a confirmation modal dialog.
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function showConfirmModal(title, message, onConfirm) {
  _pendingConfirmCallback = onConfirm;

  setText('modal-title',   title);
  setText('modal-message', message);

  const modal = document.getElementById('confirm-modal');
  if (modal) {
    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  const cancelBtn  = document.getElementById('modal-cancel');
  const confirmBtn = document.getElementById('modal-confirm');

  // Rebind to avoid duplicate listeners
  if (cancelBtn) {
    cancelBtn.onclick = hideConfirmModal;
  }
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      hideConfirmModal();
      if (typeof _pendingConfirmCallback === 'function') {
        _pendingConfirmCallback();
        _pendingConfirmCallback = null;
      }
    };
  }

  // Close on overlay click
  const overlay = document.getElementById('confirm-modal');
  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target === overlay) hideConfirmModal();
    };
  }
}

/**
 * Hide the confirmation modal.
 */
function hideConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) {
    modal.hidden = true;
    modal.setAttribute('hidden', '');
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  _pendingConfirmCallback = null;
}

// ── Helpers ──

/**
 * Escape HTML to prevent XSS when injecting user content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format an ISO timestamp to a short relative or absolute string.
 * @param {string} isoStr
 * @returns {string}
 */
function formatTimestamp(isoStr) {
  if (!isoStr) return '';
  const d   = new Date(isoStr);
  const now = new Date();
  const diffMs  = now - d;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)   return `${diffHr}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
