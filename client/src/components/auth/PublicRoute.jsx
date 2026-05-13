import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { homePathForRole } from '../../utils/authPaths.js';

export function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="shell-loading">
        <span className="spinner" aria-hidden />
        <p>Loading…</p>
      </div>
    );
  }

  // Strictly prevent authenticated users from accessing public routes
  if (isAuthenticated && user) {
    const redirectPath = homePathForRole(user.role);
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
