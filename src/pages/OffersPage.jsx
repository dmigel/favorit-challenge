import { Link, useSearchParams } from 'react-router-dom';
import AsyncView from '../components/AsyncView.jsx';
import EmptyState from '../components/EmptyState.jsx';
import OffersResults from '../components/OffersResults.jsx';
import { useOffers } from '../hooks/useOffers.js';
import { buildSearchPath } from '../utils/routes.js';

/**
 * Страница аналогов и предложений по номеру детали и бренду (этап 2).
 */
function OffersPage() {
  const [searchParams] = useSearchParams();
  const number = (searchParams.get('number') ?? '').trim();
  const brand = searchParams.get('brand') ?? '';
  const { status, error, isEmpty, requested, analogues, retry } = useOffers(
    number,
    brand,
  );

  return (
    <>
      <h1 className="h2">Аналоги и предложения</h1>

      {number === '' || brand === '' ? (
        <EmptyState
          title="Не выбран производитель"
          description="Сначала найдите деталь по номеру и выберите производителя."
        >
          <Link className="btn btn-primary" to="/">
            К поиску
          </Link>
        </EmptyState>
      ) : (
        <>
          <Link className="btn btn-link px-0" to={buildSearchPath(number)}>
            ← К списку производителей
          </Link>
          <p className="text-muted">
            Шаг 2 из 2: деталь «{number}», производитель «{brand}»
          </p>
          <AsyncView
            status={status}
            error={error}
            isEmpty={isEmpty}
            onRetry={retry}
            loadingLabel="Загружаем аналоги и предложения…"
            emptyTitle="Ничего не найдено"
            emptyDescription={`Для «${number}» (${brand}) предложений не найдено.`}
          >
            <OffersResults
              key={`${number}|${brand}`}
              requested={requested}
              analogues={analogues}
            />
          </AsyncView>
        </>
      )}
    </>
  );
}

export default OffersPage;
