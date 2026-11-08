import { describe, expect, it } from 'vitest';
import brandsFixture from '../fixtures/brands-0189.json';
import offersFixture from '../fixtures/offers-meyle-7160500039S.json';
import {
  normalizeBrands,
  normalizeOffers,
} from '../../api/normalizers.js';

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

  it('пропускает аналог с goodsID запрошенной детали', () => {
    const requestedId = 'REQ-SAME-ID';
    const result = normalizeOffers([
      {
        goodsID: requestedId,
        brand: 'OEM',
        number: '1',
        name: 'Requested',
        count: 2,
        warehouses: [
          {
            id: 'w1',
            code: 'A',
            own: true,
            price: 100,
            stock: 2,
            shipmentDate: '2026-01-01T00:00:00+03:00',
          },
        ],
        analogues: [
          {
            goodsID: requestedId,
            brand: 'OEM',
            number: '1',
            name: 'Duplicate of requested',
            count: 1,
            warehouses: [
              {
                id: 'w2',
                code: 'B',
                own: false,
                price: 90,
                stock: 1,
                shipmentDate: '2026-01-01T00:00:00+03:00',
              },
            ],
          },
          {
            goodsID: 'ANALOGUE-OTHER',
            brand: 'ALT',
            number: '2',
            name: 'Other',
            count: 3,
            warehouses: [
              {
                id: 'w3',
                code: 'C',
                own: false,
                price: 50,
                stock: 3,
                shipmentDate: '2026-01-01T00:00:00+03:00',
              },
            ],
          },
        ],
      },
    ]);

    expect(result.requested.id).toBe(requestedId);
    expect(result.analogues).toHaveLength(1);
    expect(result.analogues[0].id).toBe('ANALOGUE-OTHER');
    expect(result.analogues[0].brand).toBe('ALT');
  });
});
