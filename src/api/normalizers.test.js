import { describe, expect, it } from 'vitest';
import brandsFixture from '../test/fixtures/brands-0189.json';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import {
  isEmptyItem,
  normalizeBrands,
  normalizeOffers,
} from './normalizers.js';

const EMPTY_ITEM = {
  goodsID: '00000000-0000-0000-0000-000000000000',
  brand: '',
  number: '',
  name: '',
  count: 0,
  price: 0,
  rate: 0,
  warehouses: [],
};

describe('isEmptyItem', () => {
  it('распознаёт пустую структуру «не найдено»', () => {
    expect(isEmptyItem(EMPTY_ITEM)).toBe(true);
    expect(isEmptyItem({ brand: '', name: '', number: '', goodsID: 'x' })).toBe(
      true,
    );
  });
});

describe('normalizeBrands', () => {
  it('нормализует фикстуру этапа 1 в ожидаемом порядке', () => {
    const parts = normalizeBrands(brandsFixture.goods);

    expect(parts.map((part) => part.brand)).toEqual([
      'CAFFARO',
      'HAFFEN',
      'ZEN',
      'NGK/NTK',
    ]);

    expect(parts[3].totalStock).toBe(0);
    expect(parts[3].minPrice).toBeNull();
    expect(parts[3].offers).toEqual([]);

    expect(parts[0].minPrice).toBe(548.4);
    expect(parts[2].minPrice).toBe(1032);
  });

  it('возвращает пустой массив для пустого ответа и пустой структуры', () => {
    expect(normalizeBrands([])).toEqual([]);
    expect(normalizeBrands([EMPTY_ITEM])).toEqual([]);
  });

  it('схлопывает дубли по brand, беря первую позицию', () => {
    const duplicate = {
      ...brandsFixture.goods[0],
      brand: 'CAFFARO',
      goodsID: 'DUPLICATE-ID',
      count: 99,
    };
    const parts = normalizeBrands([
      brandsFixture.goods.find((item) => item.brand === 'CAFFARO'),
      duplicate,
    ]);

    expect(parts).toHaveLength(1);
    expect(parts[0].id).toBe('9769C10C-5401-4C55-B79B-583774FA9642');
  });

  it('отбрасывает склады с нулевым остатком', () => {
    const parts = normalizeBrands([
      {
        goodsID: 'id-1',
        brand: 'TEST',
        number: '1',
        name: 'Part',
        count: 5,
        warehouses: [
          {
            id: 'w1',
            code: 'A',
            own: false,
            price: 100,
            stock: 0,
            shipmentDate: '2026-01-01T00:00:00+03:00',
          },
          {
            id: 'w2',
            code: 'B',
            own: true,
            price: 200,
            stock: 5,
            shipmentDate: '2026-01-02T00:00:00+03:00',
          },
        ],
      },
    ]);

    expect(parts[0].offers).toHaveLength(1);
    expect(parts[0].offers[0].id).toBe('w2');
    expect(parts[0].minPrice).toBe(200);
  });
});

describe('normalizeOffers', () => {
  it('нормализует фикстуру этапа 2 для MEYLE', () => {
    const result = normalizeOffers(offersFixture.goods);

    expect(result.requested.brand).toBe('MEYLE');
    expect(result.requested.minPrice).toBe(23346.86);
    expect(result.requested.totalStock).toBe(57);
    expect(result.analogues).toHaveLength(6);

    const noStock = result.analogues.filter(
      (part) => part.brand === 'VEMO/VAICO' || part.brand === 'JD',
    );
    expect(noStock).toHaveLength(2);
    for (const part of noStock) {
      expect(part.totalStock).toBe(0);
      expect(part.offers).toEqual([]);
      expect(part.minPrice).toBeNull();
    }
  });

  it('возвращает пустой результат для пустой структуры без аналогов', () => {
    expect(normalizeOffers([EMPTY_ITEM])).toEqual({
      requested: null,
      analogues: [],
    });
    expect(normalizeOffers([])).toEqual({ requested: null, analogues: [] });
  });

  it('схлопывает дубли аналогов по goodsID и отбрасывает пустые', () => {
    const result = normalizeOffers([
      {
        ...offersFixture.goods[0],
        analogues: [
          offersFixture.goods[0].analogues[0],
          {
            ...offersFixture.goods[0].analogues[0],
            brand: 'OTHER',
          },
          EMPTY_ITEM,
        ],
      },
    ]);

    expect(result.analogues).toHaveLength(1);
    expect(result.analogues[0].brand).toBe('RTS');
  });
});
