import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole = null }) {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    // Redirect to login preserving destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required (e.g. 'admin')
  if (allowedRole && currentUser.role !== allowedRole) {
    // If regular user tries to access admin, send to user dashboard
    if (currentUser.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin tries to access user, send to admin dashboard
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
