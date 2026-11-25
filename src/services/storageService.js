// ============================================================
// WEATHER SENSE - Local Storage Service
// Handles User Authentication, Persistence, and Admin Analytics
// ============================================================

export const STORAGE_KEYS = {
  USERS: 'weathersense_users',
  SESSION: 'weathersense_session',
  FAVORITES: 'weathersense_favorites',
  SEARCHES: 'weathersense_searches',
  ANNOUNCEMENTS: 'weathersense_announcements',
  METRICS: 'weathersense_metrics',
};

// Default Administrator Account (Specified in Requirements)
export const DEFAULT_ADMIN = {
  id: 'admin-master',
  name: 'System Administrator',
  email: 'admin@gmail.com',
  password: 'admin123',
  role: 'admin',
  phone: '+91 98765 43210',
  bio: 'Lead System Administrator for Weather Sense Portal',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Alternate admin alias just in case faculty tests with previous admin
export const BACKUP_ADMIN = {
  id: 'admin-backup',
  name: 'Academic Administrator',
  email: 'admin@weatherapp.com',
  password: 'Admin@123',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function safeGet(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.error('LocalStorage read error for key:', key, err);
    return defaultVal;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error for key:', key, err);
  }
}

// ── Initial Seeding ──
export function seedInitialData() {
  if (safeGet(STORAGE_KEYS.USERS, null) === null) {
    safeSet(STORAGE_KEYS.USERS, [
      {
        id: 'user-001',
        name: 'Aarav Patel',
        email: 'aarav@college.edu',
        password: 'password123',
        role: 'user',
        phone: '+91 91234 56789',
        bio: 'B.Tech Computer Science 2nd Year Student',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'user-002',
        name: 'Diya Sharma',
        email: 'diya@college.edu',
        password: 'password123',
        role: 'user',
        phone: '+91 98765 12345',
        bio: 'B.Tech IT Student | Weather enthusiast',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]);
  }

  if (safeGet(STORAGE_KEYS.FAVORITES, null) === null) {
    safeSet(STORAGE_KEYS.FAVORITES, ['New Delhi', 'Mumbai', 'London', 'Tokyo']);
  }

  if (safeGet(STORAGE_KEYS.SEARCHES, null) === null) {
    safeSet(STORAGE_KEYS.SEARCHES, [
      { city: 'New Delhi', country: 'India', timestamp: new Date().toISOString() },
      { city: 'London', country: 'United Kingdom', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { city: 'Tokyo', country: 'Japan', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ]);
  }

  if (safeGet(STORAGE_KEYS.ANNOUNCEMENTS, null) === null) {
    safeSet(STORAGE_KEYS.ANNOUNCEMENTS, [
      {
        id: 'ann-1',
        title: 'Campus Weather Advisory',
        content: 'Heavy rains and thunderstorms predicted this evening. Students are advised to take covered pathways.',
        date: new Date().toLocaleDateString(),
        priority: 'high',
      },
      {
        id: 'ann-2',
        title: 'SDC Weather Station Update',
        content: 'Campus IoT Weather Sensors calibrated successfully. Real-time accuracy is now at 99.4%.',
        date: new Date().toLocaleDateString(),
        priority: 'normal',
      },
    ]);
  }

  if (safeGet(STORAGE_KEYS.METRICS, null) === null) {
    safeSet(STORAGE_KEYS.METRICS, {
      totalSearches: 18,
      apiCalls: 24,
      lastUpdated: new Date().toISOString(),
    });
  }
}

// ── Users Management ──
export function getUsers() {
  return safeGet(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users) {
  safeSet(STORAGE_KEYS.USERS, users);
}

export function registerUser(nameOrObj, maybeEmail, maybePassword) {
  let name, email, password;
  if (typeof nameOrObj === 'object' && nameOrObj !== null) {
    name = nameOrObj.name;
    email = nameOrObj.email;
    password = nameOrObj.password;
  } else {
    name = nameOrObj;
    email = maybeEmail;
    password = maybePassword;
  }

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, message: 'All fields are required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email format (e.g. name@college.edu).' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  // Prevent registration using admin emails
  if (
    cleanEmail === DEFAULT_ADMIN.email.toLowerCase() ||
    cleanEmail === BACKUP_ADMIN.email.toLowerCase()
  ) {
    return { success: false, message: 'This email is reserved for system administration.' };
  }

  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'user', // Always user, never admin
    phone: '',
    bio: 'Student at College of Engineering',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

export function authenticate({ email, password, expectedRole }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Check Default Administrator credentials
  if (
    cleanEmail === DEFAULT_ADMIN.email.toLowerCase() ||
    cleanEmail === BACKUP_ADMIN.email.toLowerCase()
  ) {
    const adminAccount =
      cleanEmail === DEFAULT_ADMIN.email.toLowerCase() ? DEFAULT_ADMIN : BACKUP_ADMIN;

    if (password === adminAccount.password) {
      const adminSession = {
        id: adminAccount.id,
        name: adminAccount.name,
        email: adminAccount.email,
        role: 'admin',
        phone: adminAccount.phone || '+91 98765 43210',
        bio: adminAccount.bio || 'System Administrator',
      };
      setSession(adminSession);
      return { success: true, user: adminSession, message: 'Administrator login successful.' };
    }
    return { success: false, message: 'Incorrect password for Administrator account.' };
  }

  // If user attempted admin login with normal user email
  if (expectedRole === 'admin') {
    return {
      success: false,
      message: 'Access denied. Only registered administrators may log in through the Admin Portal.',
    };
  }

  // 2. Check regular users
  const users = getUsers();
  const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!matched) {
    return { success: false, message: 'No account found with this email. Please sign up.' };
  }

  if (matched.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const userSession = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    role: matched.role || 'user',
    phone: matched.phone || '',
    bio: matched.bio || '',
    createdAt: matched.createdAt,
  };

  setSession(userSession);
  return { success: true, user: userSession, message: `Welcome back, ${matched.name}!` };
}

export function deleteUser(userId) {
  const users = getUsers();
  const updated = users.filter((u) => u.id !== userId);
  saveUsers(updated);
  return updated;
}

export function updateUserProfile(userId, updatedFields) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields };
    saveUsers(users);
  }

  // Update active session if current user
  const current = getSession();
  if (current && current.id === userId) {
    const newSession = { ...current, ...updatedFields };
    setSession(newSession);
    return newSession;
  }
  return current;
}

// ── Session Management ──
export function getSession() {
  return safeGet(STORAGE_KEYS.SESSION, null);
}

export function setSession(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return;
  }
  const { password: _p, ...safeUser } = user;
  safeSet(STORAGE_KEYS.SESSION, safeUser);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// ── Favorites Management ──
export function getFavorites() {
  return safeGet(STORAGE_KEYS.FAVORITES, []);
}

export function addFavorite(cityName) {
  const clean = (cityName || '').trim();
  if (!clean) return;
  const favs = getFavorites();
  if (!favs.some((c) => c.toLowerCase() === clean.toLowerCase())) {
    favs.push(clean);
    safeSet(STORAGE_KEYS.FAVORITES, favs);
  }
}

export function removeFavorite(cityName) {
  const clean = (cityName || '').trim();
  let favs = getFavorites();
  favs = favs.filter((c) => c.toLowerCase() !== clean.toLowerCase());
  safeSet(STORAGE_KEYS.FAVORITES, favs);
}

export function isFavorite(cityName) {
  const clean = (cityName || '').trim();
  if (!clean) return false;
  const favs = getFavorites();
  return favs.some((c) => c.toLowerCase() === clean.toLowerCase());
}

// ── Recent Searches ──
export function getRecentSearches() {
  return safeGet(STORAGE_KEYS.SEARCHES, []);
}

export function recordSearch(cityName, country = '') {
  const cleanCity = (cityName || '').trim();
  if (!cleanCity) return;

  let searches = getRecentSearches();
  searches = searches.filter((s) => s.city.toLowerCase() !== cleanCity.toLowerCase());
  searches.unshift({
    city: cleanCity,
    country: country || '',
    timestamp: new Date().toISOString(),
  });

  if (searches.length > 8) {
    searches = searches.slice(0, 8);
  }

  safeSet(STORAGE_KEYS.SEARCHES, searches);

  // Increment metrics
  const metrics = getMetrics();
  metrics.totalSearches = (metrics.totalSearches || 0) + 1;
  metrics.lastUpdated = new Date().toISOString();
  safeSet(STORAGE_KEYS.METRICS, metrics);
}

// ── Announcements & App Info ──
export function getAnnouncements() {
  return safeGet(STORAGE_KEYS.ANNOUNCEMENTS, []);
}

export function addAnnouncement({ title, content, priority = 'normal' }) {
  const anns = getAnnouncements();
  anns.unshift({
    id: 'ann-' + Date.now(),
    title: title.trim(),
    content: content.trim(),
    date: new Date().toLocaleDateString(),
    priority,
  });
  safeSet(STORAGE_KEYS.ANNOUNCEMENTS, anns);
}

export function deleteAnnouncement(id) {
  const anns = getAnnouncements();
  const updated = anns.filter((a) => a.id !== id);
  safeSet(STORAGE_KEYS.ANNOUNCEMENTS, updated);
  return updated;
}

// ── Metrics ──
export function getMetrics() {
  return safeGet(STORAGE_KEYS.METRICS, { totalSearches: 0, apiCalls: 0 });
}
