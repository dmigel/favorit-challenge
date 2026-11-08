import { useOffersView } from '../hooks/useOffersView.js';
import EmptyState from './EmptyState.jsx';
import OffersTable from './OffersTable.jsx';
import OffersToolbar from './OffersToolbar.jsx';

/**
 * Результаты этапа 2: искомая деталь, фильтры и таблица аналогов.
 * Монтируется только после успешной загрузки; useOffersView вызывается здесь.
 * @param {object} props
 * @param {import('../api/normalizers.js').Part|null} props.requested — запрошенная деталь
 * @param {import('../api/normalizers.js').Part[]} props.analogues — аналоги
 */
function OffersResults({ requested, analogues }) {
  const {
    items,
    filteredCount,
    totalCount,
    hasMore,
    remaining,
    text,
    inStockOnly,
    sort,
    setText,
    setInStockOnly,
    setSort,
    showMore,
    clearFilters,
  } = useOffersView(analogues);

  return (
    <>
      <section>
        <h2 className="h5">Искомая деталь</h2>
        <OffersTable
          items={requested ? [requested] : []}
          caption="Искомая деталь"
          rowClassName={
            requested && requested.totalStock > 0
              ? 'table-success'
              : 'table-danger'
          }
          emptyMessage="Искомая деталь не найдена"
        />
      </section>

      <h2 className="h5 mt-4">Аналоги</h2>

      {totalCount === 0 ? (
        <EmptyState
          title="Аналоги не найдены"
          description="Для этой детали аналогов нет."
        />
      ) : (
        <>
          <OffersToolbar
            text={text}
            inStockOnly={inStockOnly}
            sort={sort}
            onTextChange={setText}
            onInStockOnlyChange={setInStockOnly}
            onSortChange={setSort}
          />
          <p className="text-muted small" aria-live="polite" aria-atomic="true">
            Показано {items.length} из {filteredCount}
          </p>
          {filteredCount === 0 ? (
            <EmptyState
              title="Ничего не подошло под фильтры"
              description="Измените поиск или сбросьте фильтры."
            >
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={clearFilters}
              >
                Сбросить фильтры
              </button>
            </EmptyState>
          ) : (
            <OffersTable items={items} caption="Аналоги" />
          )}
        </>
      )}

      {hasMore ? (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={showMore}
          >
            Показать ещё (осталось {remaining})
          </button>
        </div>
      ) : null}
    </>
  );
}

export default OffersResults;
