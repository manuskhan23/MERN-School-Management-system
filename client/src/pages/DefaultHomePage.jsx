import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/constants.js';
import { DashboardPage } from './DashboardPage.jsx';

/** `/` — principals stay here; teachers and students are sent to their home routes. */
export function DefaultHomePage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === ROLES.TEACHER) return <Navigate to="/teacher" replace />;
  if (user.role === ROLES.STUDENT) return <Navigate to="/student" replace />;
  return <DashboardPage />;
}
