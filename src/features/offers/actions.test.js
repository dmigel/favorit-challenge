import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import offersFixture from '../../test/fixtures/offers-meyle-7160500039S.json';
import { TEST_NUMBERS } from '../../test/handlers.js';
import { server } from '../../test/server.js';
import { createAppStore } from '../../store/index.js';
import { STATUS } from '../../store/helpers.js';
import { fetchOffers } from './actions.js';
import {
  selectOffersAnalogues,
  selectOffersError,
  selectOffersIsEmpty,
  selectOffersRequested,
  selectOffersStatus,
} from './selectors.js';

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe('fetchOffers', () => {
  it('успешно загружает requested MEYLE и 6 аналогов', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers('7160500039S', 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.SUCCEEDED);
    expect(selectOffersRequested(store.getState()).brand).toBe('MEYLE');
    expect(selectOffersAnalogues(store.getState())).toHaveLength(6);
  });

  it('для NOT_FOUND даёт succeeded и пустой результат', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers(TEST_NUMBERS.NOT_FOUND, 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.SUCCEEDED);
    expect(selectOffersIsEmpty(store.getState())).toBe(true);
  });

  it('QUOTA -> failed с kind api и русским сообщением', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers(TEST_NUMBERS.QUOTA, 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectOffersError(store.getState())).toEqual({
      kind: 'api',
      message: 'Превышен лимит запросов, попробуйте позже',
    });
  });

  it('SERVER_ERROR -> kind http', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers(TEST_NUMBERS.SERVER_ERROR, 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectOffersError(store.getState()).kind).toBe('http');
  });

  it('NETWORK -> kind network', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers(TEST_NUMBERS.NETWORK, 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.FAILED);
    expect(selectOffersError(store.getState()).kind).toBe('network');
  });

  it('два подряд вызова с одним запросом дают ровно один fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await Promise.all([
      store.dispatch(fetchOffers('7160500039S', 'MEYLE')),
      store.dispatch(fetchOffers('7160500039S', 'MEYLE')),
    ]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(selectOffersStatus(store.getState())).toBe(STATUS.SUCCEEDED);
  });

  it('повторный вызов после succeeded не делает запроса', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers('7160500039S', 'MEYLE'));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchOffers('7160500039S', 'MEYLE'));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('после failed делает повторный запрос', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers(TEST_NUMBERS.QUOTA, 'MEYLE'));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchOffers(TEST_NUMBERS.QUOTA, 'MEYLE'));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('с другим номером делает новый запрос', async () => {
    const store = createAppStore();
    await store.dispatch(fetchOffers('7160500039S', 'MEYLE'));

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await store.dispatch(fetchOffers(TEST_NUMBERS.NOT_FOUND, 'MEYLE'));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(selectOffersIsEmpty(store.getState())).toBe(true);
  });

  it('гонка: в state остаётся результат второго (быстрого) запроса', async () => {
    server.use(
      http.get('*/api/hsprice', async ({ request }) => {
        const url = new URL(request.url);
        const number = url.searchParams.get('number');
        const brand = url.searchParams.get('brand');

        if (number === 'SLOW' && brand === 'SLOW') {
          await delay(100);
          return HttpResponse.json({
            goods: [
              {
                goodsID: 'slow-id',
                brand: 'SLOW',
                number: 'SLOW',
                name: 'Slow part',
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
                analogues: [],
              },
            ],
          });
        }

        if (number === '7160500039S' && brand === 'MEYLE') {
          await delay(10);
          return HttpResponse.json(offersFixture);
        }

        return HttpResponse.json(offersFixture);
      }),
    );

    const store = createAppStore();
    const first = store.dispatch(fetchOffers('SLOW', 'SLOW'));
    const second = store.dispatch(fetchOffers('7160500039S', 'MEYLE'));
    await Promise.all([first, second]);

    expect(store.getState().offers.query).toEqual({
      number: '7160500039S',
      brand: 'MEYLE',
    });
    expect(selectOffersRequested(store.getState()).brand).toBe('MEYLE');
    expect(selectOffersAnalogues(store.getState())).toHaveLength(6);
  });

  it('пустой номер -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchOffers('   ', 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('пустой бренд -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchOffers('7160500039S', ''));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('brand null -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchOffers('123', null));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('number null -> idle и ни одного запроса', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const store = createAppStore();

    await store.dispatch(fetchOffers(null, 'MEYLE'));

    expect(selectOffersStatus(store.getState())).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
