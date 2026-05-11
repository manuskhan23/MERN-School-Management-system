import { useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

const STATUSES = ['present', 'absent', 'late'];

export function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payload, setPayload] = useState({ records: [], classStudents: [] });
  const [statusMap, setStatusMap] = useState({});
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/api/classes?limit=100');
        setClasses(res.classes || []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const loadDay = async () => {
    if (!classId) return;
    setError('');
    setOk('');
    try {
      const q = new URLSearchParams({ date });
      const res = await api(`/api/attendance/class/${classId}?${q}`);
      const map = {};
      (res.records || []).forEach((r) => {
        const sid = r.student?._id || r.student;
        if (sid) map[sid] = r.status;
      });
      setStatusMap(map);
      setPayload({ records: res.records || [], classStudents: res.classStudents || [] });
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date]);

  const setStatus = (studentId, status) => {
    setStatusMap((m) => ({ ...m, [studentId]: status }));
  };

  const save = async () => {
    if (!classId) return;
    const records = (payload.classStudents || []).map((s) => ({
      student: s._id,
      status: statusMap[s._id] || 'absent',
    }));
    setError('');
    setOk('');
    try {
      await api('/api/attendance', {
        method: 'POST',
        body: { classId, date: new Date(date).toISOString(), records },
      });
      setOk('Attendance saved.');
      loadDay();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark attendance for a class and date." />
      <Alert message={error} />
      {ok && <div className="success-banner">{ok}</div>}

      <Card title="Session">
        <div className="row-actions" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 200, flex: 1 }}>
            <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select…</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </Select>
          </div>
          <div style={{ minWidth: 160 }}>
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button type="button" onClick={save} disabled={!classId}>
            Save marks
          </Button>
        </div>
      </Card>

      <Card title="Students" style={{ marginTop: '1rem' }}>
        {classId && payload.classStudents?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status ({formatDate(date)})</th>
                </tr>
              </thead>
              <tbody>
                {payload.classStudents.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>
                      <select className="select" value={statusMap[s._id] || ''} onChange={(e) => setStatus(s._id, e.target.value)}>
                        <option value="">—</option>
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message={classId ? 'No students in this class.' : 'Pick a class.'} />
        )}
      </Card>
    </>
  );
}
