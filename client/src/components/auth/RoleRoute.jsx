import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { homePathForRole } from '../../utils/authPaths.js';

export function RoleRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="shell-loading">
        <span className="spinner" aria-hidden />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
