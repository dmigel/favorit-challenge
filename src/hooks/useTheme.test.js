import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTheme } from './useTheme.js';

describe('useTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    localStorage.clear();
  });

  it('без атрибута начальная тема light', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('с атрибутом dark начальная тема dark', () => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('toggleTheme переключает тему, атрибут и localStorage', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBeNull();

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
