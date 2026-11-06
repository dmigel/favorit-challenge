import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { TEST_NUMBERS } from '../test/handlers.js';
import { server } from '../test/server.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { fetchBrands, fetchOffers } from './partsApi.js';

afterEach(() => {
  server.resetHandlers();
});

describe('fetchBrands', () => {
  it('возвращает 4 бренда в нужном порядке для 0189', async () => {
    const brands = await fetchBrands('0189');

    expect(brands.map((part) => part.brand)).toEqual([
      'CAFFARO',
      'HAFFEN',
      'ZEN',
      'NGK/NTK',
    ]);
  });

  it('для NOT_FOUND возвращает пустой список', async () => {
    await expect(fetchBrands(TEST_NUMBERS.NOT_FOUND)).resolves.toEqual([]);
  });
});

describe('fetchOffers', () => {
  it('запрашивает analogues=on и info=on и нормализует MEYLE', async () => {
    let capturedUrl;

    server.use(
      http.get('*/api/hsprice', ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(offersFixture);
      }),
    );

    const result = await fetchOffers('7160500039S', 'MEYLE');

    expect(result.requested.brand).toBe('MEYLE');
    expect(result.analogues).toHaveLength(6);
    expect(capturedUrl.searchParams.get('analogues')).toBe('on');
    expect(capturedUrl.searchParams.get('info')).toBe('on');
    expect(capturedUrl.searchParams.get('brand')).toBe('MEYLE');
    expect(capturedUrl.searchParams.get('number')).toBe('7160500039S');
  });

  it('для NOT_FOUND возвращает пустой результат', async () => {
    await expect(
      fetchOffers(TEST_NUMBERS.NOT_FOUND, 'MEYLE'),
    ).resolves.toEqual({
      requested: null,
      analogues: [],
    });
  });
});
