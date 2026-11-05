// ============================================================
// SDC WEATHER APP – LocalStorage Service
// ============================================================

export const LS_KEYS = {
  USERS: 'sdc_weather_users',
  SESSION: 'sdc_weather_session',
  FAVORITES: 'sdc_weather_favorites',
  RECENT: 'sdc_weather_recent',
  TIPS: 'sdc_weather_tips',
  ANNOUNCEMENTS: 'sdc_weather_announcements',
  SEARCH_COUNT: 'sdc_weather_search_count',
  ACTIVITY: 'sdc_weather_activity',
};

// Predefined demo Administrator credentials (hardcoded, never stored in normal users list)
export const ADMIN_CREDENTIALS = {
  email: 'admin@sdc.edu',
  password: 'SDCAdmin@2024',
  name: 'SDC Administrator',
  role: 'admin',
};

const DEFAULT_TIPS = [
  '☀️ Clear sky – Great day for outdoor campus activities! Stay hydrated.',
  '🌧️ Rainy weather – Carry an umbrella and wear waterproof shoes on campus.',
  '❄️ Cold conditions – Bundle up and wear warm layers for morning lectures.',
  '🌫️ Foggy weather – Drive carefully and use low beam headlights on campus roads.',
  '⛈️ Thunderstorm alert – Stay indoors in academic blocks and avoid open grounds.',
];

export function safeGet(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage read error for key:', key, e);
    return defaultVal;
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error for key:', key, e);
  }
}

export function seedDefaultData() {
  if (safeGet(LS_KEYS.TIPS, null) === null) {
    safeSet(LS_KEYS.TIPS, DEFAULT_TIPS);
  }
  if (safeGet(LS_KEYS.ANNOUNCEMENTS, null) === null) {
    safeSet(LS_KEYS.ANNOUNCEMENTS, [
      'Welcome to SDC Weather Dashboard! Check real-time campus weather forecasts.',
    ]);
  }
  if (safeGet(LS_KEYS.USERS, null) === null) {
    safeSet(LS_KEYS.USERS, []);
  }
  if (safeGet(LS_KEYS.ACTIVITY, null) === null) {
    safeSet(LS_KEYS.ACTIVITY, [
      { message: 'System initialized with default configuration', timestamp: new Date().toISOString() },
    ]);
  }
  if (safeGet(LS_KEYS.SEARCH_COUNT, null) === null) {
    safeSet(LS_KEYS.SEARCH_COUNT, 0);
  }
}

// ── Auth & Users ──

export function getUsers() {
  return safeGet(LS_KEYS.USERS, []);
}

export function saveUsers(users) {
  safeSet(LS_KEYS.USERS, users);
}

export function getCurrentSession() {
  return safeGet(LS_KEYS.SESSION, null);
}

export function setSession(user) {
  const { password: _pw, ...safeUser } = user;
  safeSet(LS_KEYS.SESSION, safeUser);
}

export function clearSession() {
  localStorage.removeItem(LS_KEYS.SESSION);
}

export function signupUser(name, email, password) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName) return { success: false, message: 'Full name is required.' };
  if (!cleanEmail) return { success: false, message: 'Email address is required.' };
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  // Prevent registering reserved admin email
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return { success: false, message: 'This email is reserved for administrators.' };
  }

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists. Please login.' };
  }

  const newUser = {
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'user', // Always creates normal user, never admin
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  logActivity(`New user registered: ${cleanName} (${cleanEmail})`);

  return { success: true, message: `Account created for ${cleanName}! You can now log in.` };
}

export function loginUser(email, password, expectedRole = 'user') {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (expectedRole === 'admin') {
    if (cleanEmail !== ADMIN_CREDENTIALS.email.toLowerCase()) {
      const users = getUsers();
      const isRegular = users.some(u => u.email.toLowerCase() === cleanEmail);
      if (isRegular) {
        return {
          success: false,
          user: null,
          message: 'Access denied. This is a regular user account without administrator privileges.',
        };
      }
      return {
        success: false,
        user: null,
        message: 'No administrator account found with this email.',
      };
    }

    if (password !== ADMIN_CREDENTIALS.password) {
      return { success: false, user: null, message: 'Incorrect administrator password.' };
    }

    setSession(ADMIN_CREDENTIALS);
    logActivity(`Administrator logged in: ${ADMIN_CREDENTIALS.email}`);
    return { success: true, user: ADMIN_CREDENTIALS, message: 'Administrator login successful.' };
  }

  // User login flow
  if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
    return {
      success: false,
      user: null,
      message: 'This is an administrator account. Please use the Admin Login tab.',
    };
  }

  const users = getUsers();
  const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!matched) {
    return { success: false, user: null, message: 'No user account found with this email. Please sign up.' };
  }

  if (matched.password !== password) {
    return { success: false, user: null, message: 'Incorrect password. Please try again.' };
  }

  setSession(matched);
  logActivity(`User logged in: ${matched.email}`);
  return { success: true, user: matched, message: `Welcome back, ${matched.name || matched.email}!` };
}

// ── Favorites ──

export function getFavorites() {
  return safeGet(LS_KEYS.FAVORITES, []);
}

export function isFavorite(cityName) {
  if (!cityName) return false;
  const favs = getFavorites();
  return favs.some(f => f.toLowerCase() === cityName.toLowerCase());
}

export function addFavorite(cityName) {
  if (!cityName) return;
  const favs = getFavorites();
  if (!isFavorite(cityName)) {
    favs.push(cityName);
    safeSet(LS_KEYS.FAVORITES, favs);
    logActivity(`Added favorite city: ${cityName}`);
  }
}

export function removeFavorite(cityName) {
  if (!cityName) return;
  let favs = getFavorites();
  favs = favs.filter(f => f.toLowerCase() !== cityName.toLowerCase());
  safeSet(LS_KEYS.FAVORITES, favs);
  logActivity(`Removed favorite city: ${cityName}`);
}

// ── Recent Searches ──

export function getRecentSearches() {
  return safeGet(LS_KEYS.RECENT, []);
}

export function addRecentSearch(cityName) {
  if (!cityName) return;
  let recent = getRecentSearches();
  recent = recent.filter(r => r.toLowerCase() !== cityName.toLowerCase());
  recent.unshift(cityName);
  if (recent.length > 5) recent = recent.slice(0, 5);
  safeSet(LS_KEYS.RECENT, recent);
}

// ── Weather Tips ──

export function getTips() {
  return safeGet(LS_KEYS.TIPS, DEFAULT_TIPS);
}

export function addTip(text) {
  const clean = (text || '').trim();
  if (!clean) return;
  const tips = getTips();
  tips.push(clean);
  safeSet(LS_KEYS.TIPS, tips);
  logActivity('Admin added a weather tip');
}

export function deleteTip(index) {
  const tips = getTips();
  if (index >= 0 && index < tips.length) {
    tips.splice(index, 1);
    safeSet(LS_KEYS.TIPS, tips);
    logActivity('Admin deleted a weather tip');
  }
}

// ── Announcements ──

export function getAnnouncements() {
  return safeGet(LS_KEYS.ANNOUNCEMENTS, []);
}

export function addAnnouncement(text) {
  const clean = (text || '').trim();
  if (!clean) return;
  const anns = getAnnouncements();
  anns.push(clean);
  safeSet(LS_KEYS.ANNOUNCEMENTS, anns);
  logActivity('Admin posted an announcement');
}

export function deleteAnnouncement(index) {
  const anns = getAnnouncements();
  if (index >= 0 && index < anns.length) {
    anns.splice(index, 1);
    safeSet(LS_KEYS.ANNOUNCEMENTS, anns);
    logActivity('Admin deleted an announcement');
  }
}

// ── Stats & Activity ──

export function getSearchCount() {
  return safeGet(LS_KEYS.SEARCH_COUNT, 0);
}

export function incrementSearchCount() {
  const count = getSearchCount();
  safeSet(LS_KEYS.SEARCH_COUNT, count + 1);
}

export function getActivityLog() {
  return safeGet(LS_KEYS.ACTIVITY, []);
}

export function logActivity(message) {
  const safeMsg = String(message || '').replace(/password[^,]*/gi, '').trim();
  const log = getActivityLog();
  log.unshift({
    message: safeMsg,
    timestamp: new Date().toISOString(),
  });
  if (log.length > 50) log.length = 50;
  safeSet(LS_KEYS.ACTIVITY, log);
}

export function clearActivityLog() {
  safeSet(LS_KEYS.ACTIVITY, []);
}
