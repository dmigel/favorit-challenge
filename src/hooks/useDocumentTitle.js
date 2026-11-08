import { useEffect } from 'react';
import { APP_TITLE } from '../utils/constants.js';

/**
 * Устанавливает `document.title` для текущей страницы.
 * При пустом `title` — только базовое имя приложения.
 * @param {string} [title]
 * @returns {void}
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
  }, [title]);
}
