import { Link } from 'react-router-dom';
import { SchoolLogo } from '../branding/SchoolLogo.jsx';
import { BRANDING } from '../../utils/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { homePathForRole } from '../../utils/authPaths.js';

export function AppHeader() {
  const { user } = useAuth();
  const home = user ? homePathForRole(user.role) : '/';

  return (
    <header className="app-topbar">
      <Link to={home} className="app-topbar-brand">
        <SchoolLogo height={36} className="app-topbar-logo" />
        <span className="app-topbar-title">{BRANDING.SCHOOL_NAME}</span>
      </Link>
    </header>
  );
}
