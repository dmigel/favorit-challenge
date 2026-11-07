import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { PAGE_SIZE, SORT } from '../utils/constants.js';
import { useOffersView } from './useOffersView.js';

/**
 * Собирает синтетическую позицию для тестов просмотра.
 * @param {Partial<import('../api/normalizers.js').Part>} [overrides]
 * @returns {import('../api/normalizers.js').Part}
 */
function makePart(overrides = {}) {
  return {
    id: 'id',
    brand: 'Brand',
    number: '1',
    name: 'Part',
    totalStock: 0,
    minPrice: null,
    notRefund: false,
    offers: [],
    ...overrides,
  };
}

const fixtureAnalogues = normalizeOffers(offersFixture.goods).analogues;

describe('useOffersView', () => {
  it('inStockOnly true для фикстуры с остатками', () => {
    const { result } = renderHook(() => useOffersView(fixtureAnalogues));

    expect(result.current.inStockOnly).toBe(true);
  });

  it('inStockOnly false, если ни у одной позиции нет остатка', () => {
    const parts = [
      makePart({ id: '1', totalStock: 0 }),
      makePart({ id: '2', totalStock: 0 }),
    ];

    const { result } = renderHook(() => useOffersView(parts));

    expect(result.current.inStockOnly).toBe(false);
  });

  it('постраничный вывод по PAGE_SIZE через showMore', () => {
    const parts = Array.from({ length: 45 }, (_, index) =>
      makePart({
        id: `id-${index}`,
        brand: `B${index}`,
        totalStock: 1,
        minPrice: index + 1,
      }),
    );

    const { result } = renderHook(() => useOffersView(parts));

    expect(result.current.items).toHaveLength(PAGE_SIZE);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.remaining).toBe(25);

    act(() => {
      result.current.showMore();
    });

    expect(result.current.items).toHaveLength(40);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.remaining).toBe(5);

    act(() => {
      result.current.showMore();
    });

    expect(result.current.items).toHaveLength(45);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.remaining).toBe(0);
  });

  it('смена фильтров/сортировки сбрасывает visibleCount к PAGE_SIZE', () => {
    const parts = Array.from({ length: 45 }, (_, index) =>
      makePart({
        id: `id-${index}`,
        brand: `B${index}`,
        name: index < 30 ? 'match' : 'other',
        totalStock: 1,
        minPrice: index + 1,
      }),
    );

    const { result } = renderHook(() => useOffersView(parts));

    act(() => {
      result.current.showMore();
    });
    expect(result.current.items.length).toBeGreaterThan(PAGE_SIZE);

    act(() => {
      result.current.setText('match');
    });
    expect(result.current.items).toHaveLength(PAGE_SIZE);

    act(() => {
      result.current.showMore();
    });
    expect(result.current.items.length).toBeGreaterThan(PAGE_SIZE);

    act(() => {
      result.current.setInStockOnly(false);
    });
    expect(result.current.items).toHaveLength(PAGE_SIZE);

    act(() => {
      result.current.showMore();
    });
    expect(result.current.items.length).toBeGreaterThan(PAGE_SIZE);

    act(() => {
      result.current.setSort(SORT.PRICE_DESC);
    });
    expect(result.current.items).toHaveLength(PAGE_SIZE);
  });

  it('filteredCount меняется от фильтров, totalCount — нет', () => {
    const { result } = renderHook(() => useOffersView(fixtureAnalogues));

    expect(result.current.totalCount).toBe(6);
    expect(result.current.filteredCount).toBe(4);

    act(() => {
      result.current.setInStockOnly(false);
    });

    expect(result.current.totalCount).toBe(6);
    expect(result.current.filteredCount).toBe(6);

    act(() => {
      result.current.setText('rts');
    });

    expect(result.current.totalCount).toBe(6);
    expect(result.current.filteredCount).toBe(1);
  });

  it('clearFilters снимает текст и «только в наличии», sort не меняет', () => {
    const { result } = renderHook(() => useOffersView(fixtureAnalogues));

    act(() => {
      result.current.setSort(SORT.PRICE_DESC);
      result.current.setText('rts');
      result.current.setInStockOnly(true);
    });

    expect(result.current.sort).toBe(SORT.PRICE_DESC);
    expect(result.current.text).toBe('rts');
    expect(result.current.inStockOnly).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.text).toBe('');
    expect(result.current.inStockOnly).toBe(false);
    expect(result.current.sort).toBe(SORT.PRICE_DESC);
    expect(result.current.items).toHaveLength(
      Math.min(PAGE_SIZE, result.current.filteredCount),
    );
  });
});
