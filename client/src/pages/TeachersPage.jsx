import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  salary: '',
};

export function TeachersPage() {
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [resetPwd, setResetPwd] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const q = new URLSearchParams({ page: String(page), limit: '10', role: 'teacher' });
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

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      salary: u.salary != null ? String(u.salary) : '',
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
            role: 'teacher',
            salary: form.salary === '' ? 0 : Number(form.salary),
          },
        });
      } else if (modal?.type === 'edit') {
        await api(`/api/users/${modal.id}`, {
          method: 'PUT',
          body: {
            name: form.name,
            email: form.email,
            role: 'teacher',
            salary: form.salary === '' ? 0 : Number(form.salary),
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
    if (!window.confirm('Delete this teacher?')) return;
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
        title="Teachers"
        subtitle="Manage teacher accounts. Each teacher needs a salary."
      />
      <Alert message={error} />

      <Card
        title="Teacher Directory"
        actions={
          <div className="row-actions">
            <input className="input" style={{ maxWidth: 200 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button type="button" onClick={() => setPage(1)}>
              Search
            </Button>
            <Button type="button" onClick={openCreate}>
              Add teacher
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
                <th>Salary</th>
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
                    <td>{u.salary != null ? Number(u.salary).toFixed(0) : '—'}</td>
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
                  <td colSpan={5}>
                    <EmptyState message="No teachers match." />
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
          title={modal === 'create' ? 'Add teacher' : 'Edit teacher'}
          onClose={() => setModal(null)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" form="teacher-form">
                Save
              </Button>
            </>
          }
        >
          <form id="teacher-form" onSubmit={submitUser}>
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
            <Input
              label="Salary"
              type="number"
              min={0}
              step={1}
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
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
