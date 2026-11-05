import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/storage';

/**
 * Route protection guard for role-based authorization
 * - Redirects logged-out visitors to /login
 * - Prevents normal users from accessing /admin
 * - Prevents admin from accessing /user (as requested by faculty specification)
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const currentUser = getCurrentUser();

  // 1. If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. If route specifies a specific role requirement
  if (allowedRole && currentUser.role !== allowedRole) {
    // If admin accidentally visits user route, redirect to admin dashboard
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // If normal user tries to access admin route, redirect to user dashboard
    return <Navigate to="/user" replace />;
  }

  return children;
}
