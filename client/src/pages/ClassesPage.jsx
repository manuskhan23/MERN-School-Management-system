import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function ClassesPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ classes: [], pages: 1, page: 1 });
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ className: '', section: '', assignedTeacher: '' });

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api('/api/classes?limit=50');
      setData(res);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const createClass = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/classes', {
        method: 'POST',
        body: {
          className: form.className,
          section: form.section,
          assignedTeacher: form.assignedTeacher || undefined,
        },
      });
      setShowModal(false);
      setForm({ className: '', section: '', assignedTeacher: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class? This removes related assignments and attendance.')) return;
    try {
      await api(`/api/classes/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Classes" subtitle="View and manage classes." />
      <Alert message={error} />

      <Card
        title="All classes"
        actions={
          user?.role === ROLES.ADMIN ? (
            <Button type="button" onClick={() => setShowModal(true)}>
              New class
            </Button>
          ) : null
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Teacher</th>
                <th>Students</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.classes?.length ? (
                data.classes.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <Link to={`/classes/${c._id}`}>
                        {c.className} {c.section}
                      </Link>
                    </td>
                    <td>{c.assignedTeacher?.name || '—'}</td>
                    <td>{c.students?.length ?? 0}</td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/classes/${c._id}`}>
                          <Button type="button" variant="ghost">
                            Open
                          </Button>
                        </Link>
                        {user?.role === ROLES.ADMIN && (
                          <Button type="button" variant="danger" onClick={() => deleteClass(c._id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No classes found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && user?.role === ROLES.ADMIN && (
        <Modal
          title="New class"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="class-form">
                Create
              </Button>
            </>
          }
        >
          <form id="class-form" onSubmit={createClass}>
            <Input required label="Class name" value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} />
            <Input required label="Section" value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} />
            <Select label="Teacher" value={form.assignedTeacher} onChange={(e) => setForm((f) => ({ ...f, assignedTeacher: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </form>
        </Modal>
      )}
    </>
  );
}
