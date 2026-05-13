import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { homePathForRole } from '../../utils/authPaths.js';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While authentication status is being determined, render nothing to prevent flicker
    return null;
  }

  if (isAuthenticated && user) {
    // If authenticated, BOUNCE them out to their dashboard
    return <Navigate to={homePathForRole(user.role)} replace state={{ from: location }} />;
  }

  // If not authenticated, render the children (e.g., LoginPage)
  return children;
}