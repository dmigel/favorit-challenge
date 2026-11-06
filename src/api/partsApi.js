import { requestParts } from './client.js';
import { normalizeBrands, normalizeOffers } from './normalizers.js';

/**
 * Загружает список производителей по номеру детали (этап 1).
 * @param {string} number
 * @returns {Promise<import('./normalizers.js').Part[]>}
 */
export async function fetchBrands(number) {
  const goods = await requestParts({ number: String(number).trim() });
  return normalizeBrands(goods);
}

/**
 * Загружает запрошенную деталь и аналоги (этап 2).
 * @param {string} number
 * @param {string} brand
 * @returns {Promise<import('./normalizers.js').OffersResult>}
 */
export async function fetchOffers(number, brand) {
  const goods = await requestParts({
    number: String(number).trim(),
    brand,
    analogues: 'on',
    info: 'on',
  });
  return normalizeOffers(goods);
}
