import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="shell-loading">
        <span className="spinner" aria-hidden />
        <p>Loading…</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user is suspended, show message
  if (user.status === 'suspended') {
    return (
      <div className="shell-loading">
        <p>Your account has been suspended. Please contact support.</p>
      </div>
    );
  }

  return <Outlet />;
}