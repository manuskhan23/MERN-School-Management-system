import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, assetUrl } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { formatDate, classLabel } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { DateTimeInput } from '../components/ui/DateTimeInput.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function AssignmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [a, setA] = useState(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState({ title: '', description: '', dueDate: '' });
  const [submitText, setSubmitText] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [gradeForm, setGradeForm] = useState({});

  const load = async () => {
    setError('');
    try {
      const res = await api(`/api/assignments/${id}`);
      setA(res);
      setEdit({
        title: res.title,
        description: res.description,
        dueDate: res.dueDate ? new Date(res.dueDate).toISOString().slice(0, 16) : '',
      });
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/assignments/${id}`, {
        method: 'PUT',
        body: { title: edit.title, description: edit.description, dueDate: edit.dueDate },
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteAsg = async () => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api(`/api/assignments/${id}`, { method: 'DELETE' });
      window.location.href = '/assignments';
    } catch (e) {
      setError(e.message);
    }
  };

  const submitWork = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    if (submitText) fd.append('text', submitText);
    if (submitFile) fd.append('file', submitFile);
    try {
      await api(`/api/assignments/${id}/submit`, { method: 'PUT', body: fd });
      setSubmitText('');
      setSubmitFile(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const grade = async (studentId) => {
    const g = gradeForm[studentId] || {};
    try {
      await api(`/api/assignments/${id}/grade/${studentId}`, {
        method: 'PUT',
        body: { grade: Number(g.grade), feedback: g.feedback || '' },
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!a) return error ? <Alert message={error} /> : <p className="empty">Loading…</p>;

  const isOwnerTeacher = user?.role === ROLES.TEACHER && a.teacher?._id === user._id;
  const canEdit = user?.role === ROLES.ADMIN || isOwnerTeacher;
  const isAssignmentDue = new Date(a.dueDate) < new Date();
  const studentSubmission = a.submissions?.find((s) => s.student?._id === user?._id || s.student === user?._id);

  return (
    <>
      <p style={{ marginBottom: '0.5rem' }}>
        <Link to="/assignments">← Assignments</Link>
      </p>
      <PageHeader title={a.title} subtitle={`${classLabel(a.class)} · Due ${formatDate(a.dueDate)}`} />
      <Alert message={error} />

      {a.attachments?.length > 0 && (
        <Card title="Attachments">
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {a.attachments.map((path) => (
              <li key={path}>
                <a href={assetUrl(path)} target="_blank" rel="noreferrer">
                  {path.split('/').pop()}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Description" style={{ marginTop: '1rem' }}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--muted)' }}>{a.description}</p>
      </Card>

      {canEdit && (
        <Card title="Edit" style={{ marginTop: '1rem' }}>
          <form onSubmit={saveEdit}>
            <Input label="Title" value={edit.title} onChange={(e) => setEdit((x) => ({ ...x, title: e.target.value }))} />
            <Textarea label="Description" value={edit.description} onChange={(e) => setEdit((x) => ({ ...x, description: e.target.value }))} />
            <DateTimeInput id="dueDate" label="Due" value={edit.dueDate} onChange={(e) => setEdit((x) => ({ ...x, dueDate: e.target.value }))} />
            <div className="row-actions">
              <Button type="submit">Save</Button>
              <Button type="button" variant="danger" onClick={deleteAsg}>
                Delete
              </Button>
            </div>
          </form>
        </Card>
      )}

      {user?.role === ROLES.STUDENT && (
        <Card title="Your submission" style={{ marginTop: '1rem' }}>
          {isAssignmentDue && !studentSubmission && (
            <Alert message="This assignment is past due. No more submissions are allowed." />
          )}
          {isAssignmentDue && studentSubmission && (
            <Alert message="This assignment is past due. You can view your submission but cannot modify it." />
          )}
          {!isAssignmentDue ? (
            <form onSubmit={submitWork}>
              <Textarea label="Notes" value={submitText} onChange={(e) => setSubmitText(e.target.value)} />
              <div className="field">
                <span className="label">File</span>
                <input type="file" className="input" onChange={(e) => setSubmitFile(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          ) : (
            <div>
              {studentSubmission ? (
                <div>
                  <p><strong>Notes:</strong></p>
                  <p>{studentSubmission.text || '(none)'}</p>
                  {studentSubmission.file && (
                    <p>
                      <strong>File:</strong>
                      <br />
                      <a href={assetUrl(studentSubmission.file)} target="_blank" rel="noreferrer">
                        {studentSubmission.file.split('/').pop()}
                      </a>
                    </p>
                  )}
                  {studentSubmission.grade && (
                    <p><strong>Grade:</strong> {studentSubmission.grade}</p>
                  )}
                  {studentSubmission.feedback && (
                    <p><strong>Feedback:</strong> {studentSubmission.feedback}</p>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>You did not submit this assignment.</p>
              )}
            </div>
          )}
        </Card>
      )}

      {user?.role === ROLES.TEACHER && (
        <Card title="Submissions" style={{ marginTop: '1rem' }}>
          {a.submissions?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submitted</th>
                    <th>Grade</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {a.submissions.map((s) => {
                    const sid = s.student?._id || s.student;
                    const name = s.student?.name || 'Student';
                    return (
                      <tr key={sid}>
                        <td>{name}</td>
                        <td>{formatDate(s.submittedAt)}</td>
                        <td>{s.grade ?? '—'}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 200 }}>
                            <Input
                              placeholder="Grade"
                              type="number"
                              value={gradeForm[sid]?.grade ?? ''}
                              onChange={(e) =>
                                setGradeForm((gf) => ({
                                  ...gf,
                                  [sid]: { ...gf[sid], grade: e.target.value, feedback: gf[sid]?.feedback ?? '' },
                                }))
                              }
                            />
                            <Input
                              placeholder="Feedback"
                              value={gradeForm[sid]?.feedback ?? ''}
                              onChange={(e) =>
                                setGradeForm((gf) => ({
                                  ...gf,
                                  [sid]: { ...gf[sid], feedback: e.target.value, grade: gf[sid]?.grade ?? '' },
                                }))
                              }
                            />
                            <Button type="button" variant="ghost" onClick={() => grade(sid)}>
                              Save grade
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No submissions yet." />
          )}
        </Card>
      )}
    </>
  );
}
