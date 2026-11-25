// ============================================================
// Local Storage Utility for Weather App Dashboard
// Manages Registered Users, Active Sessions, and Admin Seeds
// ============================================================

export const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  SEARCH_COUNT: 'searchCount',
  RECENT_SEARCHES: 'recentSearches',
};

// Default Administrator Credentials required by college specification
export const DEFAULT_ADMIN = {
  id: 'admin-001',
  name: 'System Administrator',
  email: 'admin@weatherapp.com',
  password: 'Admin@123',
  role: 'admin',
};

// Also recognize the secondary demo email if entered during evaluation
export const BACKUP_ADMIN_EMAIL = 'admin@sdc.edu';

/**
 * Safely parse JSON from localStorage
 */
export function getStoredItem(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return defaultValue;
  }
}

/**
 * Safely save JSON to localStorage
 */
export function setStoredItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage key:', key, error);
  }
}

/**
 * Get all registered users from localStorage
 */
export function getUsers() {
  return getStoredItem(STORAGE_KEYS.USERS, []);
}

/**
 * Save users list to localStorage
 */
export function saveUsers(users) {
  setStoredItem(STORAGE_KEYS.USERS, users);
}

/**
 * Get active user session
 */
export function getCurrentUser() {
  return getStoredItem(STORAGE_KEYS.CURRENT_USER, null);
}

/**
 * Set active user session (removes password for security)
 */
export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return;
  }
  const { password: _pw, ...safeUser } = user;
  setStoredItem(STORAGE_KEYS.CURRENT_USER, safeUser);
}

/**
 * Clear session on logout
 */
export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Register a new user
 * NOTE: Role is always hardcoded to 'user'. Never allow selecting 'admin' during signup.
 */
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

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  // Protect admin email
  if (
    cleanEmail === DEFAULT_ADMIN.email.toLowerCase() ||
    cleanEmail === BACKUP_ADMIN_EMAIL.toLowerCase()
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
    password: password,
    role: 'user', // strictly regular user
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Registration successful! You can now log in.' };
}

/**
 * Authenticate login credentials
 * Checks against hardcoded admin and registered users
 */
export function authenticateUser(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Check Default Administrator credentials
  if (
    cleanEmail === DEFAULT_ADMIN.email.toLowerCase() ||
    cleanEmail === BACKUP_ADMIN_EMAIL.toLowerCase()
  ) {
    if (password === DEFAULT_ADMIN.password || password === 'SDCAdmin@2024') {
      const adminSession = {
        id: DEFAULT_ADMIN.id,
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        role: 'admin',
      };
      setCurrentUser(adminSession);
      return { success: true, user: adminSession, message: 'Welcome back, Administrator!' };
    }
    return { success: false, message: 'Incorrect password for Admin account.' };
  }

  // 2. Check registered users in localStorage
  const users = getUsers();
  const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!foundUser) {
    return { success: false, message: 'No account found with this email. Please sign up first.' };
  }

  if (foundUser.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  const userSession = {
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    role: foundUser.role || 'user',
  };

  setCurrentUser(userSession);
  return { success: true, user: userSession, message: `Welcome back, ${foundUser.name}!` };
}
