import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import './AdminHomePage.css';

export function AdminHomePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Manage system-wide settings and users" />
      <div className="grid-2">
        <Card title="Admin Links">
          <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
            <li><Link to="/users">User Management</Link></li>
            <li><Link to="/reports">Reports</Link></li>
          </ul>
        </Card>
        <Card title="Signed in as">
          <p style={{ margin: 0, color: "var(--muted)" }}>
            <strong style={{ color: "var(--text)" }}>{user.name}</strong>
            <br />
            {user.email}
          </p>
        </Card>
      </div>
    </>
  );
}
