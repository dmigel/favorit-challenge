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

  it('setTheme(dark) меняет theme, атрибут и localStorage', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBeNull();

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('setTheme с недопустимым значением ничего не меняет', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('x');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('без вызова setTheme в localStorage ничего не пишется', () => {
    renderHook(() => useTheme());

    expect(localStorage.getItem('theme')).toBeNull();
  });
});
