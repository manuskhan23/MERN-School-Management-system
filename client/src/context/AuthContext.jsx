import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false); // New state for suspension

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api('/api/auth/me');
        if (!cancelled) {
          setUser(me);
          setIsSuspended(me?.status === 'suspended');
        }
      } catch {
        if (!cancelled) setUser(null);
        setIsSuspended(false); // Ensure this is reset on any error during token validation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      setUser(null);
      setIsSuspended(false);
    }
  };

  const refreshUser = async () => {
    const me = await api('/api/auth/me');
    setUser(me);
    setIsSuspended(me.status === 'suspended'); // Update suspension status on refresh
    return me;
  };

  const value = useMemo(
    () => ({
      user,
      isSuspended, // Expose isSuspended state
      loading,
      login,
      logout,
      refreshUser,
      isAuthenticated: Boolean(user),
    }),
    [user, isSuspended, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
