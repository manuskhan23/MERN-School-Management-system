import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';

export function StudentHomePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Student home" subtitle="Your principal or teacher creates your account; use the links below to get around." />
      <div className="grid-2">
        <Card title="Quick links">
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)' }}>
            <li>
              <Link to="/classes">My classes</Link>
            </li>
            <li>
              <Link to="/assignments">Assignments</Link>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </Card>
        <Card title="Signed in as">
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
            <br />
            {user.email}
          </p>
        </Card>
      </div>
    </>
  );
}
