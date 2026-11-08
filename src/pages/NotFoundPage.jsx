import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

/**
 * Страница 404.
 */
function NotFoundPage() {
  useDocumentTitle('Страница не найдена');

  return (
    <EmptyState title="Страница не найдена">
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </EmptyState>
  );
}

export default NotFoundPage;
