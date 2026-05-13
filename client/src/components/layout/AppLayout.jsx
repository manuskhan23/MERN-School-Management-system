import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { AppHeader } from './AppHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx'; // Import useAuth
import { SuspendedUserPage } from '../SuspendedUserPage.jsx'; // Import the new component

export function AppLayout() {
  const { user, isSuspended, loading } = useAuth(); // Get isSuspended from AuthContext

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (isSuspended) {
    return <SuspendedUserPage />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main-wrap">
        <AppHeader />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
