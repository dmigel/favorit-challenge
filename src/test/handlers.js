import { http, HttpResponse } from 'msw';
import brandsFixture from './fixtures/brands-0189.json';
import offersFixture from './fixtures/offers-meyle-7160500039S.json';
import emptyKeyFixture from './fixtures/error-empty-key.json';

/**
 * Специальные номера деталей для тестовых сценариев.
 */
export const TEST_NUMBERS = {
  NOT_FOUND: 'NOTFOUND',
  QUOTA: 'QUOTA',
  SERVER_ERROR: 'FAIL500',
  NETWORK: 'NETFAIL',
};

/** Пустая структура ответа «не найдено» из SPEC. */
const EMPTY_NOT_FOUND = {
  goods: [
    {
      goodsID: '00000000-0000-0000-0000-000000000000',
      brand: '',
      number: '',
      name: '',
      count: 0,
      price: 0,
      rate: 0,
      warehouses: [],
    },
  ],
};

/**
 * Общие MSW-обработчики API подбора запчастей.
 */
export const handlers = [
  http.get('*/hs/hsprice/', ({ request }) => {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const number = url.searchParams.get('number');
    const brand = url.searchParams.get('brand');
    const analogues = url.searchParams.get('analogues');

    if (!key) {
      return HttpResponse.json(emptyKeyFixture);
    }

    if (!number) {
      return HttpResponse.json({ error: 'Empty number goods!' });
    }

    if (number === TEST_NUMBERS.NOT_FOUND) {
      return HttpResponse.json(EMPTY_NOT_FOUND);
    }

    if (number === TEST_NUMBERS.QUOTA) {
      return HttpResponse.json({ error: 'Request quota exceeded!' });
    }

    if (number === TEST_NUMBERS.SERVER_ERROR) {
      return HttpResponse.text('oops', { status: 500 });
    }

    if (number === TEST_NUMBERS.NETWORK) {
      return HttpResponse.error();
    }

    if (brand && analogues === 'on') {
      return HttpResponse.json(offersFixture);
    }

    return HttpResponse.json(brandsFixture);
  }),
];
