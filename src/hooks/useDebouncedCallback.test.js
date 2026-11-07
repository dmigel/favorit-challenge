import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedCallback } from './useDebouncedCallback.js';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('три быстрых вызова -> один вызов с аргументами последнего', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('a');
      result.current('ab');
      result.current('abc');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('abc');
  });

  it('cancel() отменяет отложенный вызов', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('abc');
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('размонтирование отменяет отложенный вызов', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 500),
    );

    act(() => {
      result.current('abc');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('если callback поменялся до срабатывания, вызывается новый', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 500),
      { initialProps: { callback: first } },
    );

    act(() => {
      result.current('abc');
    });

    rerender({ callback: second });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith('abc');
  });

  it('функция стабильна между рендерами при том же delay', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      { initialProps: { delay: 500 } },
    );

    const first = result.current;
    rerender({ delay: 500 });
    expect(result.current).toBe(first);

    rerender({ delay: 300 });
    expect(result.current).not.toBe(first);
  });
});
