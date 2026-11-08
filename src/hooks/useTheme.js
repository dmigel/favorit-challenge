import { useCallback, useEffect, useState } from 'react';
import { readTheme, saveTheme } from '../utils/theme.js';

/**
 * Хук переключения светлой/тёмной темы Bootstrap (`data-bs-theme`).
 * Сохранение в localStorage только по клику (toggle), не из эффекта.
 * @returns {{ theme: 'dark' | 'light', toggleTheme: () => void }}
 */
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
