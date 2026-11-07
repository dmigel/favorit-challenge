import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATUS } from '../store/helpers.js';
import { TEST_NUMBERS } from '../test/handlers.js';
import { renderHookWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import { useOffers } from './useOffers.js';

describe('useOffers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('пустой number -> idle и ни одного fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHookWithProviders(() => useOffers('', 'MEYLE'));

    expect(result.current.status).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('пустой brand -> idle и ни одного fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHookWithProviders(() =>
      useOffers('7160500039S', ''),
    );

    expect(result.current.status).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('MEYLE + номер -> loading, затем succeeded с 6 аналогами', async () => {
    const { result } = renderHookWithProviders(() =>
      useOffers('7160500039S', 'MEYLE'),
    );

    expect(result.current.status).toBe(STATUS.LOADING);

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });

    expect(result.current.requested.brand).toBe('MEYLE');
    expect(result.current.analogues).toHaveLength(6);
  });

  it('при смене brand сразу loading и пустые analogues', async () => {
    const { result, rerender } = renderHookWithProviders(
      ({ number, brand }) => useOffers(number, brand),
      { initialProps: { number: '7160500039S', brand: 'MEYLE' } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });

    expect(result.current.analogues).toHaveLength(6);

    rerender({ number: '7160500039S', brand: 'RTS' });

    expect(result.current.status).toBe(STATUS.LOADING);
    expect(result.current.analogues).toEqual([]);
  });

  it('retry после ошибки квоты приводит к succeeded', async () => {
    server.use(
      http.get(
        '*/api/hsprice',
        () => HttpResponse.json({ error: 'Request quota exceeded!' }),
        { once: true },
      ),
    );

    const { result } = renderHookWithProviders(() =>
      useOffers('7160500039S', 'MEYLE'),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.FAILED);
    });

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });
  });

  it('NOT_FOUND с любым брендом -> succeeded и isEmpty', async () => {
    const { result } = renderHookWithProviders(() =>
      useOffers(TEST_NUMBERS.NOT_FOUND, 'ANY'),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });

    expect(result.current.isEmpty).toBe(true);
  });

  it('бренд NGK/NTK доходит до сервера без искажений', async () => {
    let receivedBrand = null;

    server.use(
      http.get('*/api/hsprice', ({ request }) => {
        receivedBrand = new URL(request.url).searchParams.get('brand');
        return HttpResponse.json({
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
        });
      }),
    );

    const { result } = renderHookWithProviders(() =>
      useOffers('0189', 'NGK/NTK'),
    );

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });

    expect(receivedBrand).toBe('NGK/NTK');
  });
});
