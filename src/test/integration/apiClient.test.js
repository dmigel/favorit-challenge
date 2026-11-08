import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '../server.js';
import { TEST_NUMBERS } from '../handlers.js';
import { requestParts } from '../../api/client.js';

afterEach(() => {
  server.resetHandlers();
});

describe('requestParts', () => {
  it('успешно возвращает goods и передаёт key с number без brand', async () => {
    let capturedUrl;

    server.use(
      http.get('*/api/hsprice', ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({
          goods: [
            {
              goodsID: '1',
              brand: 'A',
              number: '0189',
              name: 'x',
              count: 1,
              warehouses: [],
            },
          ],
        });
      }),
    );

    const goods = await requestParts({ number: '0189' });

    expect(goods).toHaveLength(1);
    expect(capturedUrl.searchParams.get('key')).toBe('test-key');
    expect(capturedUrl.searchParams.get('number')).toBe('0189');
    expect(capturedUrl.searchParams.has('brand')).toBe(false);
  });

  it('передаёт спецсимволы в number без искажений', async () => {
    let capturedNumber;

    server.use(
      http.get('*/api/hsprice', ({ request }) => {
        const url = new URL(request.url);
        capturedNumber = url.searchParams.get('number');
        return HttpResponse.json({ goods: [] });
      }),
    );

    await requestParts({ number: 'A#B&C/1' });

    expect(capturedNumber).toBe('A#B&C/1');
  });

  it('при сбое сети бросает ApiError kind network', async () => {
    await expect(
      requestParts({ number: TEST_NUMBERS.NETWORK }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'network',
      message: 'Нет соединения с сервером',
    });
  });

  it('при HTTP 500 с не-JSON бросает ApiError kind http', async () => {
    await expect(
      requestParts({ number: TEST_NUMBERS.SERVER_ERROR }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'http',
      status: 500,
      message: 'Сервер вернул ошибку 500',
    });
  });

  it('при 200 с не-JSON бросает ApiError kind parse', async () => {
    server.use(
      http.get('*/api/hsprice', () => HttpResponse.text('not-json')),
    );

    await expect(requestParts({ number: '0189' })).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'parse',
      message: 'Некорректный ответ сервера',
    });
  });

  it('при error в теле бросает ApiError kind api с русским сообщением', async () => {
    await expect(
      requestParts({ number: TEST_NUMBERS.QUOTA }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'api',
      message: 'Превышен лимит запросов, попробуйте позже',
      details: ['Request quota exceeded!'],
    });
  });
});
