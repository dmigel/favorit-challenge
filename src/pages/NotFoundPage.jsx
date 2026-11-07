import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Страница 404.
 */
function NotFoundPage() {
  return (
    <EmptyState title="Страница не найдена">
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </EmptyState>
  );
}

export default NotFoundPage;
