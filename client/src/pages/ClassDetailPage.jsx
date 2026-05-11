import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function ClassDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [cls, setCls] = useState(null);
  const [studentsPool, setStudentsPool] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [edit, setEdit] = useState({ className: '', section: '', assignedTeacher: '' });
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const c = await api(`/api/classes/${id}`);
      setCls(c);
      setEdit({
        className: c.className,
        section: c.section,
        assignedTeacher: c.assignedTeacher?._id || '',
      });
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== ROLES.ADMIN) return;
    (async () => {
      try {
        const res = await api('/api/users?role=student&limit=500');
        setStudentsPool(res.users || []);
      } catch {
        setStudentsPool([]);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (user?.role !== ROLES.TEACHER) return;
    (async () => {
      try {
        const res = await api('/api/classes?limit=200');
        setAllClasses((res.classes || []).filter((c) => c._id !== id));
      } catch {
        /* ignore */
      }
    })();
  }, [user?.role, id]);

  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) return;
    (async () => {
      try {
        const res = await api('/api/users?role=teacher&limit=200');
        setTeachers(res.users || []);
      } catch {
        /* ignore */
      }
    })();
  }, [user?.role]);

  const canManageStudents = user?.role === ROLES.ADMIN || user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;

  const addStudent = async () => {
    if (!studentId) return;
    try {
      await api(`/api/classes/${id}/add-student`, { method: 'PUT', body: { studentId } });
      setStudentId('');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeStudent = async (sid) => {
    try {
      await api(`/api/classes/${id}/remove-student`, { method: 'PUT', body: { studentId: sid } });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const promote = async () => {
    if (!targetClassId) return;
    try {
      await api(`/api/classes/${id}/promote`, { method: 'PUT', body: { targetClassId } });
      setTargetClassId('');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const saveClass = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await api(`/api/classes/${id}`, {
        method: 'PUT',
        body: {
          className: edit.className,
          section: edit.section,
          assignedTeacher: edit.assignedTeacher || undefined,
        },
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!cls) {
    return error ? <Alert message={error} /> : <p className="empty">Loading…</p>;
  }

  return (
    <>
      <p style={{ marginBottom: '0.5rem' }}>
        <Link to="/classes">← Classes</Link>
      </p>
      <PageHeader title={`${cls.className} ${cls.section}`} subtitle="Roster and settings." />
      <Alert message={error} />

      {isAdmin && (
        <Card title="Edit class">
          <form onSubmit={saveClass} className="grid-2" style={{ display: 'block' }}>
            <Input label="Class name" value={edit.className} onChange={(e) => setEdit((x) => ({ ...x, className: e.target.value }))} />
            <Input label="Section" value={edit.section} onChange={(e) => setEdit((x) => ({ ...x, section: e.target.value }))} />
            <Select label="Teacher" value={edit.assignedTeacher} onChange={(e) => setEdit((x) => ({ ...x, assignedTeacher: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <div style={{ marginTop: '0.5rem' }}>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      )}

      {canManageStudents && (
        <div style={{ marginTop: '1rem' }}>
          <Card title="Add student">
            {isAdmin ? (
              <div className="row-actions">
                <select className="select" style={{ flex: 1, maxWidth: 320 }} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">Select student…</option>
                  {studentsPool.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addStudent}>
                  Add
                </Button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 0 }}>
                  User search is admin-only in the API. Enter a student&apos;s user ID to add them to this class.
                </p>
                <div className="row-actions">
                  <Input label="Student ID" placeholder="MongoDB ObjectId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                  <Button type="button" onClick={addStudent}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {user?.role === ROLES.TEACHER && (
        <div style={{ marginTop: '1rem' }}>
          <Card title="Promote all students">
          <div className="row-actions">
            <select className="select" style={{ flex: 1, maxWidth: 320 }} value={targetClassId} onChange={(e) => setTargetClassId(e.target.value)}>
              <option value="">Target class…</option>
              {allClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </select>
            <Button type="button" onClick={promote}>
              Promote
            </Button>
          </div>
        </Card>
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <Card title="Students">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {canManageStudents && <th />}
              </tr>
            </thead>
            <tbody>
              {cls.students?.length ? (
                cls.students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    {canManageStudents && (
                      <td>
                        <Button type="button" variant="danger" onClick={() => removeStudent(s._id)}>
                          Remove
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageStudents ? 3 : 2}>
                    <EmptyState message="No students in this class." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </>
  );
}
