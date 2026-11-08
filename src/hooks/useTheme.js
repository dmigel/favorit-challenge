import { useCallback, useEffect, useState } from 'react';
import { readTheme, saveTheme } from '../utils/theme.js';

/**
 * Хук выбора светлой/тёмной темы Bootstrap (`data-bs-theme`).
 * Сохранение в localStorage только по вызову setTheme, не из эффекта.
 * @returns {{ theme: 'dark' | 'light', setTheme: (value: string) => void }}
 */
export function useTheme() {
  const [theme, setThemeState] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const setTheme = useCallback((value) => {
    if (value !== 'light' && value !== 'dark') {
      return;
    }
    setThemeState(value);
    saveTheme(value);
  }, []);

  return { theme, setTheme };
}
