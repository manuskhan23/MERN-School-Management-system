import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  // On app init, verify session from httpOnly cookie
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth - verifying httpOnly cookie session');
        // Call /api/auth/me - if cookie is valid, this will restore user session
        // The cookie is sent automatically with credentials: include
        const me = await api('/api/auth/me');
        
        if (!cancelled) {
          console.log('[Auth] Session restored from cookie:', me.email);
          setUser(me);
          setIsSuspended(me?.status === 'suspended');
        }
      } catch (error) {
        console.log('[Auth] No valid session cookie - user not authenticated');
        // No valid cookie or error - user is not authenticated
        if (!cancelled) {
          setUser(null);
          setIsSuspended(false);
        }
      } finally {
        if (!cancelled) {
          console.log('[Auth] Auth initialization complete');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    console.log('[Auth] Logging in:', email);
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    console.log('[Auth] Login successful - setting user and cookie');
    setUser(data.user);
    setIsSuspended(data.user?.status === 'suspended');
    return data;
  };

  const logout = async () => {
    try {
      console.log('[Auth] Calling logout endpoint');
      await api('/api/auth/logout', { method: 'POST' });
      console.log('[Auth] Logout successful - cookie cleared on server');
    } catch (error) {
      console.warn('[Auth] Logout API call failed:', error.message);
    } finally {
      console.log('[Auth] Clearing user state on client');
      setUser(null);
      setIsSuspended(false);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('[Auth] Refreshing user data from server');
      const me = await api('/api/auth/me');
      setUser(me);
      setIsSuspended(me?.status === 'suspended');
      return me;
    } catch (error) {
      console.warn('[Auth] Failed to refresh user');
      setUser(null);
      setIsSuspended(false);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      isSuspended,
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