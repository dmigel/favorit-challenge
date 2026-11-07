import { Link, Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';

/**
 * Общий каркас приложения: шапка, контент с Outlet, подвал.
 */
function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <Link to="/" className="navbar-brand">
            Подбор автозапчастей
          </Link>
        </div>
      </nav>

      <main className="container flex-grow-1 py-4">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="border-top py-3 text-center text-muted small">
        Тестовое задание · подбор автозапчастей по номеру и производителю
      </footer>
    </div>
  );
}

export default Layout;
