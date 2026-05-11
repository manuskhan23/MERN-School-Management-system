import { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function ReportsPage() {
  const [attendance, setAttendance] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [activity, setActivity] = useState({ logs: [], pages: 1, page: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setError('');
      try {
        const [a, p, act] = await Promise.all([
          api('/api/reports/attendance'),
          api('/api/reports/performance'),
          api('/api/reports/activity?limit=30'),
        ]);
        setAttendance(Array.isArray(a) ? a : []);
        setPerformance(Array.isArray(p) ? p : []);
        setActivity(act);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <>
      <PageHeader title="Reports" subtitle="Attendance summaries and graded performance (admin)." />
      <Alert message={error} />

      <Card title="Attendance by class">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Teacher</th>
                <th>Records</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length ? (
                attendance.map((row) => (
                  <tr key={row.classId}>
                    <td>
                      {row.className} {row.section}
                    </td>
                    <td>{row.teacher}</td>
                    <td>{row.totalRecords}</td>
                    <td>{row.present}</td>
                    <td>{row.absent}</td>
                    <td>{row.late}</td>
                    <td>{row.percentage}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No attendance data." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Performance (graded work)" style={{ marginTop: '1rem' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Average</th>
                <th>Graded count</th>
              </tr>
            </thead>
            <tbody>
              {performance.length ? (
                performance.map((row, idx) => (
                  <tr key={row.student?._id || idx}>
                    <td>{row.student?.name}</td>
                    <td>
                      {row.className} {row.section}
                    </td>
                    <td>{row.averageGrade}</td>
                    <td>{row.totalGraded}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No graded submissions yet." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Activity log" style={{ marginTop: '1rem' }}>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          {activity.logs?.length ? (
            activity.logs.map((log) => (
              <li key={log._id} style={{ marginBottom: '0.4rem' }}>
                {log.message}
              </li>
            ))
          ) : (
            <EmptyState message="No activity." />
          )}
        </ul>
      </Card>
    </>
  );
}
