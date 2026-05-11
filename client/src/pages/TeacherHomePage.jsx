import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';

export function TeacherHomePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Teacher home" subtitle="Manage your classes, attendance, and students you enroll." />
      <div className="grid-2">
        <Card title="Quick links">
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)' }}>
            <li>
              <Link to="/students">Students you added</Link>
            </li>
            <li>
              <Link to="/classes">Your classes</Link>
            </li>
            <li>
              <Link to="/assignments">Assignments</Link>
            </li>
            <li>
              <Link to="/attendance">Attendance</Link>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
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
