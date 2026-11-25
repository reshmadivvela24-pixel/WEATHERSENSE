import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSession,
  setSession,
  clearSession,
  authenticate,
  registerUser,
  updateUserProfile,
  seedInitialData,
} from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getSession());

  useEffect(() => {
    // Seed initial admin, sample users, and announcements if first run
    seedInitialData();

    // Listen for storage changes across tabs or windows
    const handleStorage = () => {
      setCurrentUser(getSession());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email, password, expectedRole = null) => {
    const result = authenticate({ email, password, expectedRole });
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  };

  const signup = async (nameOrObj, email, password) => {
    let name, userEmail, userPassword;
    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      name = nameOrObj.name;
      userEmail = nameOrObj.email;
      userPassword = nameOrObj.password;
    } else {
      name = nameOrObj;
      userEmail = email;
      userPassword = password;
    }

    const result = registerUser(name, userEmail, userPassword);
    if (result.success && result.user) {
      const sessionUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role || 'user',
        phone: result.user.phone || '',
        bio: result.user.bio || 'Student at College of Engineering',
      };
      setSession(sessionUser);
      setCurrentUser(sessionUser);
    }
    return result;
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const updateProfile = (fields) => {
    if (!currentUser) return null;
    const updated = updateUserProfile(currentUser.id, fields);
    if (updated) {
      setCurrentUser(updated);
    }
    return updated;
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isUser: currentUser?.role === 'user',
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
