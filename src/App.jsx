import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentUser } from './utils/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    // Keep user state synchronized with localStorage
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Routes>
      {/* Default route redirect based on session */}
      <Route
        path="/"
        element={
          currentUser ? (
            currentUser.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/user" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Administrator Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Protected Normal User Route */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Fallback for undefined paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
