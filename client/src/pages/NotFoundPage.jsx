import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <PageHeader title="Page not found" subtitle="The link may be broken or the page was removed." />
      <Button type="button" onClick={() => navigate('/')}>
        Go home
      </Button>
    </div>
  );
}
