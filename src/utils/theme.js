import { THEME_STORAGE_KEY } from './constants.js';

/**
 * Читает текущую тему из атрибута data-bs-theme на <html>.
 * @returns {'dark' | 'light'}
 */
export function readTheme() {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark'
    ? 'dark'
    : 'light';
}

/**
 * Сохраняет выбор темы в localStorage.
 * Ошибка хранилища не должна ломать приложение.
 * @param {'dark' | 'light'} theme
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // QuotaExceeded / private mode и т.п. — игнорируем.
  }
}
