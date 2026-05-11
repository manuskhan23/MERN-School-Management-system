import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { formatDate, classLabel } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function AssignmentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ assignments: [], pages: 1, page: 1 });
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class: '', dueDate: '', files: [] });

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api('/api/assignments?limit=50');
      setData(res);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role !== ROLES.TEACHER) return;
    (async () => {
      try {
        const res = await api('/api/classes?limit=100');
        setClasses(res.classes || []);
      } catch {
        /* ignore */
      }
    })();
  }, [user?.role]);

  const createAssignment = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('class', form.class);
    fd.append('dueDate', form.dueDate);
    (form.files || []).forEach((f) => fd.append('attachments', f));

    try {
      await api('/api/assignments', { method: 'POST', body: fd });
      setShowModal(false);
      setForm({ title: '', description: '', class: '', dueDate: '', files: [] });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Assignments" subtitle="View and open assignments." />
      <Alert message={error} />

      <Card
        title="List"
        actions={
          user?.role === ROLES.TEACHER ? (
            <Button type="button" onClick={() => setShowModal(true)}>
              New assignment
            </Button>
          ) : null
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Class</th>
                <th>Due</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.assignments?.length ? (
                data.assignments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{classLabel(a.class)}</td>
                    <td>{formatDate(a.dueDate)}</td>
                    <td>
                      <Link to={`/assignments/${a._id}`}>
                        <Button type="button" variant="ghost">
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No assignments." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal
          title="New assignment"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="asg-form">
                Publish
              </Button>
            </>
          }
        >
          <form id="asg-form" onSubmit={createAssignment}>
            <Input required label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea required label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Select required label="Class" value={form.class} onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}>
              <option value="">Select…</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </Select>
            <Input required label="Due date" type="datetime-local" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <div className="field">
              <span className="label">Attachments (optional)</span>
              <input
                type="file"
                multiple
                className="input"
                onChange={(e) => setForm((f) => ({ ...f, files: Array.from(e.target.files || []) }))}
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
