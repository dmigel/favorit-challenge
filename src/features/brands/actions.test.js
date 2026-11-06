import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import brandsFixture from '../../test/fixtures/brands-0189.json';
import { TEST_NUMBERS } from '../../test/handlers.js';
import { server } from '../../test/server.js';
import { createAppStore } from '../../store/index.js';
import { STATUS } from '../../store/helpers.js';
import { fetchBrands } from './actions.js';
import {
  selectBrandsError,
  selectBrandsIsEmpty,
  selectBrandsItems,
  selectBrandsStatus,
} from './selectors.js';

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe('fetchBrands', () => {
  it('успешно загружает 4 бренда в нужном порядке', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands('0189'));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.SUCCEEDED);
    expect(selectBrandsItems(store.getState()).map((part) => part.brand)).toEqual([
      'CAFFARO',
      'HAFFEN',
      'ZEN',
      'NGK/NTK',
    ]);
  });

  it('для NOT_FOUND даёт succeeded и пустой результат', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands(TEST_NUMBERS.NOT_FOUND));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.SUCCEEDED);
    expect(selectBrandsIsEmpty(store.getState())).toBe(true);
  });

  it('QUOTA -> failed с kind api и русским сообщением', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands(TEST_NUMBERS.QUOTA));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectBrandsError(store.getState())).toEqual({
      kind: 'api',
      message: 'Превышен лимит запросов, попробуйте позже',
    });
  });

  it('SERVER_ERROR -> kind http', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands(TEST_NUMBERS.SERVER_ERROR));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectBrandsError(store.getState()).kind).toBe('http');
  });

  it('NETWORK -> kind network', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands(TEST_NUMBERS.NETWORK));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectBrandsError(store.getState()).kind).toBe('network');
  });

  it('два подряд вызова с одним номером дают ровно один fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await Promise.all([
      store.dispatch(fetchBrands('0189')),
      store.dispatch(fetchBrands('0189')),
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(selectBrandsStatus(store.getState())).toBe(STATUS.SUCCEEDED);
  });

  it('повторный вызов после succeeded не делает запроса', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands('0189'));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchBrands('0189'));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('после failed делает повторный запрос', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands(TEST_NUMBERS.QUOTA));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchBrands(TEST_NUMBERS.QUOTA));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('с другим номером делает новый запрос', async () => {
    const store = createAppStore();
    await store.dispatch(fetchBrands('0189'));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchBrands(TEST_NUMBERS.NOT_FOUND));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(selectBrandsIsEmpty(store.getState())).toBe(true);
  });

  it('гонка: в state остаётся результат второго (быстрого) запроса', async () => {
    server.use(
      http.get('*/api/hsprice', async ({ request }) => {
        const number = new URL(request.url).searchParams.get('number');
        if (number === 'SLOW') {
          await delay(100);
          return HttpResponse.json({
            goods: [
              {
                goodsID: 'slow-id',
                brand: 'SLOW',
                number: 'SLOW',
                name: 'Slow',
                count: 1,
                price: 1,
                rate: 1,
                warehouses: [
                  {
                    code: 'A',
                    id: 'w1',
                    own: false,
                    price: 1,
                    shipmentDate: '2026-01-01T00:00:00+03:00',
                    stock: 1,
                  },
                ],
              },
            ],
          });
        }
        if (number === 'FAST') {
          await delay(10);
          return HttpResponse.json(brandsFixture);
        }
        return HttpResponse.json(brandsFixture);
      }),
    );

    const store = createAppStore();
    const first = store.dispatch(fetchBrands('SLOW'));
    const second = store.dispatch(fetchBrands('FAST'));
    await Promise.all([first, second]);

    expect(store.getState().brands.query).toEqual({ number: 'FAST' });
    expect(selectBrandsItems(store.getState()).map((part) => part.brand)).toEqual([
      'CAFFARO',
      'HAFFEN',
      'ZEN',
      'NGK/NTK',
    ]);
  });

  it('пустой номер -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchBrands('   '));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('null -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchBrands(null));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('undefined -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchBrands(undefined));

    expect(selectBrandsStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
