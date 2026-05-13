import { AppRoutes } from './routes/AppRoutes.jsx';
import { AuthInitializer } from './components/auth/AuthInitializer.jsx';

export default function App() {
  return (
    <AuthInitializer>
      <AppRoutes />
    </AuthInitializer>
  );
}
