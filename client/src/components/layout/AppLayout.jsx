import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { AppHeader } from './AppHeader.jsx';

export function AppLayout() {
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
