import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { ROLES } from '../utils/constants.js';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await api('/api/auth/profile', { method: 'PUT', body: { name, profileImage } });
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await api('/api/auth/change-password', { method: 'PUT', body: { oldPassword, newPassword } });
      setOldPassword('');
      setNewPassword('');
      setMsg({ type: 'success', text: 'Password changed.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle={user.email} />
      {msg.text && <Alert type={msg.type} message={msg.text} />}
      <div className="grid-2">
        <Card title="Details">
          <form onSubmit={saveProfile}>
            <Input label="Name" id="pname" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Profile image URL"
              id="pimg"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://…"
            />
            <Button type="submit" disabled={busy}>
              Save profile
            </Button>
          </form>
        </Card>
        {user?.role === ROLES.ADMIN && (
          <Card title="Change password">
            <form onSubmit={savePassword}>
              <Input label="Current password" id="oldp" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <Input label="New password" id="newp" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button type="submit" disabled={busy}>
                Update password
              </Button>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
