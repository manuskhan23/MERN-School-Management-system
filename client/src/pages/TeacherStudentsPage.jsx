import { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { classLabel } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  assignedClass: '',
  registrationFee: '',
};

export function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [sRes, cRes] = await Promise.all([api('/api/users/my-students'), api('/api/classes?limit=200')]);
      setStudents(sRes.students || []);
      setClasses(cRes.classes || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/api/users/students', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          assignedClass: form.assignedClass,
          registrationFee: form.registrationFee === '' ? 0 : Number(form.registrationFee),
        },
      });
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Students" subtitle="Add students to a class you teach. Name, email, password, and registration fee are saved." />
      <Alert message={error} />

      <div className="grid-2">
        <Card title="Add student">
          <form onSubmit={submit}>
            <Input label="Full name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <Select label="Class" required value={form.assignedClass} onChange={(e) => setForm((f) => ({ ...f, assignedClass: e.target.value }))}>
              <option value="">— Select class —</option>
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
            <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Saving…' : 'Save student'}
            </Button>
          </form>
        </Card>

        <Card title="Students in your classes">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {students.length ? (
                  students.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{classLabel(u.assignedClass)}</td>
                      <td>{u.registrationFee != null ? Number(u.registrationFee).toFixed(0) : '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState message="No students in your classes yet." />
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
