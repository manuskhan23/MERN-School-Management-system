import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { homePathForRole } from '../../utils/authPaths.js';

export function PublicOnlyRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  // If user is authenticated, BOUNCE them to their dashboard
  if (isAuthenticated && user) {
    const redirectPath = homePathForRole(user.role);
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  // Allow unauthenticated users to access public routes (login page)
  return <Outlet />;
}