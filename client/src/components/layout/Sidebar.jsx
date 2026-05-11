import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../utils/constants.js';
import { homePathForRole } from '../../utils/authPaths.js';
import { SchoolLogo } from '../branding/SchoolLogo.jsx';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '0.55rem 0.85rem',
  borderRadius: '8px',
  color: isActive ? '#f8fafc' : '#94a3b8',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
});

export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = [];

  items.push({ to: homePathForRole(user.role), label: 'Dashboard', end: true });

  if (user.role === ROLES.ADMIN) {
    items.push({ to: '/users', label: 'Users' });
    items.push({ to: '/reports', label: 'Reports' });
  }

  items.push({ to: '/classes', label: 'Classes' });
  items.push({ to: '/assignments', label: 'Assignments' });

  if (user.role === ROLES.TEACHER) {
    items.push({ to: '/students', label: 'Students' });
    items.push({ to: '/attendance', label: 'Attendance' });
  }

  items.push({ to: '/notifications', label: 'Notifications' });
  items.push({ to: '/profile', label: 'Profile' });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <SchoolLogo height={40} className="sidebar-brand-logo" />
        <div className="sidebar-brand-text">
          <div className="sidebar-title">Portal</div>
          <div className="sidebar-role">{user.role}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={`${item.to}-${item.label}`} to={item.to} end={Boolean(item.end)} style={linkStyle}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{user.name}</div>
        <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
