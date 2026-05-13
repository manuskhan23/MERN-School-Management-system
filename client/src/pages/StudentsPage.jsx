import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { classLabel } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  assignedClass: '',
  registrationFee: '',
};

export function StudentsPage() {
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [resetPwd, setResetPwd] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const q = new URLSearchParams({ page: String(page), limit: '10', role: 'student' });
      if (search) q.set('search', search);
      const res = await api(`/api/users?${q}`);
      setData(res);
    } catch (e) {
      setError(e.message);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      try {
        const c = await api('/api/classes?limit=200');
        setClasses(c.classes || []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      assignedClass: u.assignedClass?._id || '',
      registrationFee: u.registrationFee != null ? String(u.registrationFee) : '',
    });
    setModal({ type: 'edit', id: u._id });
  };

  const submitUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'create') {
        await api('/api/users', {
          method: 'POST',
          body: {
            name: form.name,
            email: form.email,
            password: form.password,
            role: 'student',
            assignedClass: form.assignedClass || undefined,
            registrationFee: form.registrationFee === '' ? 0 : Number(form.registrationFee),
          },
        });
      } else if (modal?.type === 'edit') {
        await api(`/api/users/${modal.id}`, {
          method: 'PUT',
          body: {
            name: form.name,
            email: form.email,
            role: 'student',
            assignedClass: form.assignedClass || null,
            registrationFee: form.registrationFee === '' ? 0 : Number(form.registrationFee),
          },
        });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api(`/api/users/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const doResetPassword = async (id) => {
    if (!resetPwd || resetPwd.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    try {
      await api(`/api/users/${id}/reset-password`, { method: 'PUT', body: { newPassword: resetPwd } });
      setModal(null);
      setResetPwd('');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api(`/api/users/${id}/toggle-status`, { method: 'PUT' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Manage student accounts. Each student needs an assigned class and registration fee."
      />
      <Alert message={error} />

      <Card
        title="Student Directory"
        actions={
          <div className="row-actions">
            <input className="input" style={{ maxWidth: 200 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="button" onClick={() => setPage(1)}>
              Search
            </Button>
            <Button type="button" onClick={openCreate}>
              Add student
            </Button>
          </div>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Reg. fee</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.users?.length ? (
                data.users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{classLabel(u.assignedClass)}</td>
                    <td>{u.registrationFee != null ? Number(u.registrationFee).toFixed(0) : '—'}</td>
                    <td>
                      <Badge status={u.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button type="button" variant="ghost" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => { setResetPwd(''); setModal({ type: 'reset', id: u._id, name: u.name }); }}>
                          Reset pwd
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => toggleStatus(u._id)}>
                          Toggle
                        </Button>
                        <Button type="button" variant="danger" onClick={() => deleteUser(u._id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="No students match." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="row-actions" style={{ marginTop: '1rem' }}>
          <Button type="button" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span style={{ color: 'var(--muted)', alignSelf: 'center' }}>
            Page {data.page} / {data.pages || 1}
          </span>
          <Button type="button" variant="ghost" disabled={page >= (data.pages || 1)} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </Card>

      {(modal === 'create' || modal?.type === 'edit') && (
        <Modal
          title={modal === 'create' ? 'Add student' : 'Edit student'}
          onClose={() => setModal(null)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" form="student-form">
                Save
              </Button>
            </>
          }
        >
          <form id="student-form" onSubmit={submitUser}>
            <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            {modal === 'create' && (
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            )}
            <Select label="Assigned class" value={form.assignedClass} onChange={(e) => setForm((f) => ({ ...f, assignedClass: e.target.value }))}>
              <option value="">— None —</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </Select>
            <Input
              label="Registration fee"
              type="number"
              min={0}
              step={1}
              value={form.registrationFee}
              onChange={(e) => setForm((f) => ({ ...f, registrationFee: e.target.value }))}
            />
          </form>
        </Modal>
      )}

      {modal?.type === 'reset' && (
        <Modal title={`Reset password — ${modal.name}`} onClose={() => setModal(null)}>
          <Input label="New password" type="password" value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} />
          <div className="row-actions" style={{ marginTop: '1rem' }}>
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => doResetPassword(modal.id)}>
              Reset
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
