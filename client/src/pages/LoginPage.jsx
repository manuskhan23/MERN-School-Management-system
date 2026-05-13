import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Keep useAuth for login function
import { AuthPageLayout } from '../components/layout/AuthPageLayout.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { homePathForRole } from '../utils/authPaths.js';

export function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Safety check: if accessed directly or via refresh, don't show the form if logged in.
  // The PublicRoute guard should catch this first, but this prevents "flickering".
  if (loading || (isAuthenticated && user)) {
    return <div className="loading-screen" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      const dest = from && from !== '/login' ? from : homePathForRole(data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageLayout>
      <Card title="Sign in" className="login-card">
        <p className="auth-card-lead">Accounts are created by the principal or your teacher. Use the email and password they gave you.</p>
        <Alert message={error} />
        <form onSubmit={handleSubmit}>
          <Input id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </AuthPageLayout>
  );
}
