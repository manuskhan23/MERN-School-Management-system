import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { ROLES } from '../utils/constants.js';
import { formatDateTime } from '../utils/format.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function NotificationsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ notifications: [], pages: 1, page: 1 });
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');
  const [compose, setCompose] = useState(false);
  const [form, setForm] = useState({ message: '', classId: '' });
  const [classes, setClasses] = useState([]);

  const load = useCallback(async () => {
    setError('');
    try {
      const [list, count] = await Promise.all([api('/api/notifications?limit=50'), api('/api/notifications/unread-count')]);
      setData(list);
      setUnread(count.count ?? 0);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.TEACHER)) return;
    (async () => {
      try {
        const c = await api('/api/classes?limit=200');
        setClasses(c.classes || []);
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  const markRead = async (id) => {
    try {
      await api(`/api/notifications/${id}/read`, { method: 'PUT' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const markAll = async () => {
    try {
      await api('/api/notifications/read-all', { method: 'PUT' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/notifications/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    try {
      if (!form.classId) {
        setError('Choose a class');
        return;
      }
      const body = { message: form.message, type: 'announcement', classId: form.classId };
      await api('/api/notifications', { method: 'POST', body });
      setCompose(false);
      setForm({ message: '', classId: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const canCompose = user?.role === ROLES.ADMIN;

  return (
    <>
      <PageHeader title="Notifications" subtitle={unread ? `${unread} unread` : 'Inbox'} />
      <Alert message={error} />

      <Card
        title="Inbox"
        actions={
          <div className="row-actions">
            <Button type="button" variant="ghost" onClick={markAll}>
              Mark all read
            </Button>
            {canCompose && (
              <Button type="button" onClick={() => setCompose(true)}>
                Compose
              </Button>
            )}
          </div>
        }
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data.notifications?.length ? (
            data.notifications.map((n) => (
              <li
                key={n._id}
                style={{
                  padding: '0.85rem 0',
                  borderBottom: '1px solid var(--border)',
                  opacity: n.readStatus ? 0.75 : 1,
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {formatDateTime(n.createdAt)} · from {n.sender?.name || 'System'}
                </div>
                <div style={{ marginTop: '0.35rem' }}>{n.message}</div>
                <div className="row-actions" style={{ marginTop: '0.5rem' }}>
                  {!n.readStatus && (
                    <Button type="button" variant="ghost" onClick={() => markRead(n._id)}>
                      Mark read
                    </Button>
                  )}
                  <Button type="button" variant="danger" onClick={() => remove(n._id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <EmptyState message="No notifications." />
          )}
        </ul>
      </Card>

      {compose && (
        <Modal
          title="Send notification"
          onClose={() => setCompose(false)}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setCompose(false)}>
                Cancel
              </Button>
              <Button type="submit" form="notif-form">
                Send
              </Button>
            </>
          }
        >
          <form id="notif-form" onSubmit={send}>
            <Textarea label="Message" required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            <Select label="To class" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
              <option value="">—</option>
              {user?.role === ROLES.ADMIN && <option value="whole-school">Whole School</option>}
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.section}
                </option>
              ))}
            </Select>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {user?.role === ROLES.ADMIN
                ? 'Send to a specific class or the whole school.'
                : 'Teachers: send to everyone in one of your classes.'}
            </p>
          </form>
        </Modal>
      )}
    </>
  );
}
