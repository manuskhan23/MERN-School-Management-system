import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/reports/dashboard');
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (!user) return null;

  if (user.role === ROLES.ADMIN) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Overview of your school." />
        <Alert message={error} />
        {stats && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-value">{stats.totalStudents}</div>
                <div className="stat-label">Students</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.totalTeachers}</div>
                <div className="stat-label">Teachers</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.totalClasses}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.totalAssignments}</div>
                <div className="stat-label">Assignments</div>
              </div>
            </div>
            <div className="grid-2">
              <Card title="Recent assignments">
                {stats.recentAssignments?.length ? (
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)' }}>
                    {stats.recentAssignments.map((a) => (
                      <li key={a._id} style={{ marginBottom: '0.5rem' }}>
                        <Link to={`/assignments/${a._id}`}>{a.title}</Link>
                        {' · '}
                        {formatDate(a.dueDate)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No assignments yet." />
                )}
              </Card>
              <Card title="Recent activity">
                {stats.recentNotifications?.length ? (
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                    {stats.recentNotifications.map((n) => (
                      <li key={n._id} style={{ marginBottom: '0.5rem' }}>
                        {n.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No notifications yet." />
                )}
              </Card>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Hello, ${user.name}`} subtitle="Use the sidebar to manage classes, assignments, and more." />
      <div className="grid-2">
        <Card title="Quick links">
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)' }}>
            <li>
              <Link to="/classes">Classes</Link>
            </li>
            <li>
              <Link to="/assignments">Assignments</Link>
            </li>
            <li>
              <Link to="/notifications">Notifications</Link>
            </li>
            {user.role === ROLES.TEACHER && (
              <li>
                <Link to="/attendance">Attendance</Link>
              </li>
            )}
          </ul>
        </Card>
        <Card title="Your role">{user.role}</Card>
      </div>
    </>
  );
}
