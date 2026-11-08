import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../../api/normalizers.js';
import offersFixture from '../fixtures/offers-meyle-7160500039S.json';
import { SORT } from '../../utils/constants.js';
import { filterAndSortParts } from '../../utils/partsView.js';

/**
 * Собирает синтетическую позицию для тестов фильтрации/сортировки.
 * @param {Partial<import('../../api/normalizers.js').Part>} [overrides]
 * @returns {import('../../api/normalizers.js').Part}
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
      'JD',
      'VEMO/VAICO',
    ]);
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

  it('равные по основному ключу идут по brand, затем по number независимо от исходного порядка', () => {
    const shuffled = [
      makePart({ id: '1', brand: 'Beta', number: '20', totalStock: 5, minPrice: 100 }),
      makePart({ id: '2', brand: 'Alpha', number: '30', totalStock: 5, minPrice: 100 }),
      makePart({ id: '3', brand: 'Alpha', number: '10', totalStock: 5, minPrice: 100 }),
      makePart({ id: '4', brand: 'Gamma', number: '5', totalStock: 5, minPrice: 100 }),
    ];
    const expected = ['Alpha/10', 'Alpha/30', 'Beta/20', 'Gamma/5'];
    const key = (part) => `${part.brand}/${part.number}`;

    for (const sort of [SORT.PRICE_ASC, SORT.PRICE_DESC, SORT.STOCK_DESC]) {
      expect(
        filterAndSortParts(shuffled, {
          inStockOnly: false,
          sort,
          text: '',
        }).map(key),
      ).toEqual(expected);
    }
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
