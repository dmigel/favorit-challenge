import { useCallback, useMemo, useState } from 'react';
import { PAGE_SIZE, SORT } from '../utils/constants.js';
import { filterAndSortParts } from '../utils/partsView.js';

/**
 * Локальное состояние просмотра списка аналогов: фильтры, сортировка, пагинация.
 * @param {import('../api/normalizers.js').Part[]} analogues
 * @returns {{
 *   items: import('../api/normalizers.js').Part[],
 *   filteredCount: number,
 *   totalCount: number,
 *   hasMore: boolean,
 *   remaining: number,
 *   text: string,
 *   inStockOnly: boolean,
 *   sort: string,
 *   setText: (value: string) => void,
 *   setInStockOnly: (value: boolean) => void,
 *   setSort: (value: string) => void,
 *   showMore: () => void,
 *   clearFilters: () => void
 * }}
 */
export function useOffersView(analogues) {
  const [text, setTextState] = useState('');
  const [inStockOnly, setInStockOnlyState] = useState(() =>
    analogues.some((part) => part.totalStock > 0),
  );
  const [sort, setSortState] = useState(SORT.PRICE_ASC);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => filterAndSortParts(analogues, { inStockOnly, sort, text }),
    [analogues, inStockOnly, sort, text],
  );

  const items = filtered.slice(0, visibleCount);
  const filteredCount = filtered.length;
  const totalCount = analogues.length;
  const remaining = filteredCount - items.length;
  const hasMore = remaining > 0;

  const setText = useCallback((value) => {
    setTextState(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const setInStockOnly = useCallback((value) => {
    setInStockOnlyState(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const setSort = useCallback((value) => {
    setSortState(value);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const showMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  const clearFilters = useCallback(() => {
    setTextState('');
    setInStockOnlyState(false);
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
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
  };
}
