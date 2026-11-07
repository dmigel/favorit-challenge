/**
 * Строит путь страницы поиска по номеру детали.
 * Пустой или неопределённый номер даёт корневой путь без query.
 * @param {string|null|undefined} number
 * @returns {string}
 */
export function buildSearchPath(number) {
  if (!number) {
    return '/';
  }

  return `/?${new URLSearchParams({ number })}`;
}

/**
 * Строит путь страницы предложений по номеру детали и бренду.
 * @param {string} number
 * @param {string} brand
 * @returns {string}
 */
export function buildOffersPath(number, brand) {
  return `/offers?${new URLSearchParams({ number, brand })}`;
}
