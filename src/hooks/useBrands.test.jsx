import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATUS } from '../store/helpers.js';
import { server } from '../test/server.js';
import { renderHookWithProviders } from '../test/renderWithProviders.jsx';
import { useBrands } from './useBrands.js';

describe('useBrands', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('пустой number -> idle и ни одного fetch', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { result } = renderHookWithProviders(() => useBrands(''));

    expect(result.current.status).toBe(STATUS.IDLE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('number 0189 -> loading, затем succeeded', async () => {
    const { result } = renderHookWithProviders(() => useBrands('0189'));

    expect(result.current.status).toBe(STATUS.LOADING);

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });
  });

  it('при смене number сразу возвращает loading, а не старые данные', async () => {
    const { result, rerender } = renderHookWithProviders(
      ({ number }) => useBrands(number),
      { initialProps: { number: '0189' } },
    );

    await waitFor(() => {
      expect(result.current.status).toBe(STATUS.SUCCEEDED);
    });

    rerender({ number: '0420' });

    expect(result.current.status).toBe(STATUS.LOADING);
  });

  it('retry после ошибки квоты приводит к succeeded', async () => {
    server.use(
      http.get(
        '*/api/hsprice',
        () => HttpResponse.json({ error: 'Request quota exceeded!' }),
        { once: true },
      ),
    );

    const { result } = renderHookWithProviders(() => useBrands('0189'));

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
});

