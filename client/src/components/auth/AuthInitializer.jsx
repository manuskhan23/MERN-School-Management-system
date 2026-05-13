import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Ensures auth state is loaded before rendering routes.
 * This prevents race conditions where routes render before auth is verified.
 */
export function AuthInitializer({ children }) {
  const { loading } = useAuth();

  useEffect(() => {
    // Log auth initialization for debugging
    if (!loading) {
      console.debug('Auth state initialized');
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="shell-loading">
        <span className="spinner" aria-hidden />
        <p>Initializing…</p>
      </div>
    );
  }

  return children;
}
