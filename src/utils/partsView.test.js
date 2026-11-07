import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { SORT } from './constants.js';
import { filterAndSortParts } from './partsView.js';

/**
 * Собирает синтетическую позицию для тестов фильтрации/сортировки.
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

describe('filterAndSortParts', () => {
  it('PRICE_ASC с inStockOnly: LEX, RTS, Mapco, SUFIX', () => {
    const result = filterAndSortParts(fixtureAnalogues, {
      inStockOnly: true,
      sort: SORT.PRICE_ASC,
      text: '',
    });

    expect(result.map((part) => part.brand)).toEqual([
      'LEX',
      'RTS',
      'Mapco',
      'SUFIX',
    ]);
  });

  it('PRICE_ASC без inStockOnly: позиции без цены в конце', () => {
    const result = filterAndSortParts(fixtureAnalogues, {
      inStockOnly: false,
      sort: SORT.PRICE_ASC,
      text: '',
    });

    expect(result.map((part) => part.brand)).toEqual([
      'LEX',
      'RTS',
      'Mapco',
      'SUFIX',
      'VEMO/VAICO',
      'JD',
    ]);
  });

  it('PRICE_DESC без inStockOnly: дорогие сначала, без цены в конце', () => {
    const result = filterAndSortParts(fixtureAnalogues, {
      inStockOnly: false,
      sort: SORT.PRICE_DESC,
      text: '',
    });

    expect(result.map((part) => part.brand)).toEqual([
      'SUFIX',
      'Mapco',
      'RTS',
      'LEX',
      'VEMO/VAICO',
      'JD',
    ]);
  });

  it('STOCK_DESC сортирует по убыванию остатка на синтетике', () => {
    const parts = [
      makePart({ id: 'a', brand: 'A', totalStock: 10, minPrice: 100 }),
      makePart({ id: 'b', brand: 'B', totalStock: 50, minPrice: 200 }),
      makePart({ id: 'c', brand: 'C', totalStock: 30, minPrice: 50 }),
    ];

    const result = filterAndSortParts(parts, {
      inStockOnly: false,
      sort: SORT.STOCK_DESC,
      text: '',
    });

    expect(result.map((part) => part.brand)).toEqual(['B', 'C', 'A']);
  });

  it('текстовый фильтр ищет подстроки без учёта регистра', () => {
    expect(
      filterAndSortParts(fixtureAnalogues, {
        inStockOnly: false,
        sort: SORT.PRICE_ASC,
        text: 'rts',
      }).map((part) => part.brand),
    ).toEqual(['RTS']);

    expect(
      filterAndSortParts(fixtureAnalogues, {
        inStockOnly: false,
        sort: SORT.PRICE_ASC,
        text: 'сайлентблок',
      }).map((part) => part.brand),
    ).toEqual(['LEX']);
  });

  it('многословный фильтр требует каждое слово (не подряд)', () => {
    const result = filterAndSortParts(fixtureAnalogues, {
      inStockOnly: false,
      sort: SORT.PRICE_ASC,
      text: 'рычаг подвески',
    });

    expect(result.map((part) => part.brand)).toEqual([
      'RTS',
      'Mapco',
      'SUFIX',
      'JD',
    ]);
  });

  it('текст из одних пробелов не фильтрует', () => {
    const result = filterAndSortParts(fixtureAnalogues, {
      inStockOnly: false,
      sort: SORT.PRICE_ASC,
      text: '   ',
    });

    expect(result).toHaveLength(fixtureAnalogues.length);
  });

  it('сортировка стабильна и неизвестный sort не меняет порядок', () => {
    const parts = [
      makePart({ id: '1', brand: 'A', totalStock: 5, minPrice: 100 }),
      makePart({ id: '2', brand: 'B', totalStock: 5, minPrice: 100 }),
      makePart({ id: '3', brand: 'C', totalStock: 5, minPrice: 100 }),
    ];

    expect(
      filterAndSortParts(parts, {
        inStockOnly: false,
        sort: SORT.PRICE_ASC,
        text: '',
      }).map((part) => part.brand),
    ).toEqual(['A', 'B', 'C']);

    expect(
      filterAndSortParts(parts, {
        inStockOnly: false,
        sort: 'unknown-sort',
        text: '',
      }).map((part) => part.brand),
    ).toEqual(['A', 'B', 'C']);
  });

  it('не мутирует входной Object.freeze-массив', () => {
    const parts = Object.freeze([
      makePart({ id: '1', brand: 'Z', totalStock: 1, minPrice: 300 }),
      makePart({ id: '2', brand: 'A', totalStock: 2, minPrice: 100 }),
    ]);

    const snapshot = parts.map((part) => part.brand);
    const result = filterAndSortParts(parts, {
      inStockOnly: false,
      sort: SORT.PRICE_ASC,
      text: '',
    });

    expect(parts.map((part) => part.brand)).toEqual(snapshot);
    expect(result.map((part) => part.brand)).toEqual(['A', 'Z']);
  });
});
