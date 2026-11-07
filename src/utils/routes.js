/**
 * Строит путь страницы предложений по номеру детали и бренду.
 * @param {string} number
 * @param {string} brand
 * @returns {string}
 */
export function buildOffersPath(number, brand) {
  return `/offers?${new URLSearchParams({ number, brand })}`;
}
