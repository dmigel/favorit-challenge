import { afterEach, describe, expect, it, vi } from 'vitest';
import { readTheme, saveTheme } from './theme.js';

describe('theme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('readTheme без атрибута возвращает light', () => {
    expect(readTheme()).toBe('light');
  });

  it('readTheme с dark возвращает dark', () => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    expect(readTheme()).toBe('dark');
  });

  it('readTheme с любым другим значением возвращает light', () => {
    document.documentElement.setAttribute('data-bs-theme', 'auto');
    expect(readTheme()).toBe('light');
  });

  it('saveTheme пишет в localStorage', () => {
    saveTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('saveTheme не бросает, когда setItem бросает', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveTheme('light')).not.toThrow();
  });
});
