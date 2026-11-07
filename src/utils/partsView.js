import { SORT } from './constants.js';

/**
 * Детерминированный tie-breaker: brand, затем number (localeCompare 'ru').
 * @param {import('../api/normalizers.js').Part} a
 * @param {import('../api/normalizers.js').Part} b
 * @returns {number}
 */
function compareByBrandThenNumber(a, b) {
  const byBrand = a.brand.localeCompare(b.brand, 'ru');
  if (byBrand !== 0) {
    return byBrand;
  }
  return a.number.localeCompare(b.number, 'ru');
}

/**
 * Сравнивает две позиции по минимальной цене; null всегда в конце.
 * При равенстве — tie-breaker по brand, затем number.
 * @param {import('../api/normalizers.js').Part} a
 * @param {import('../api/normalizers.js').Part} b
 * @param {1|-1} direction — 1 для возрастания, -1 для убывания
 * @returns {number}
 */
function compareByPrice(a, b, direction) {
  const aNull = a.minPrice === null;
  const bNull = b.minPrice === null;

  if (aNull && bNull) {
    return compareByBrandThenNumber(a, b);
  }
  if (aNull) {
    return 1;
  }
  if (bNull) {
    return -1;
  }

  const byPrice = direction * (a.minPrice - b.minPrice);
  if (byPrice !== 0) {
    return byPrice;
  }
  return compareByBrandThenNumber(a, b);
}

/**
 * Фильтрует и сортирует аналоги для локального просмотра этапа 2.
 * Входной массив не мутируется; при известных sort порядок детерминирован.
 * @param {import('../api/normalizers.js').Part[]} parts
 * @param {{ inStockOnly?: boolean, sort?: string, text?: string }} [options]
 * @returns {import('../api/normalizers.js').Part[]}
 */
export function filterAndSortParts(
  parts,
  { inStockOnly = false, sort = SORT.PRICE_ASC, text = '' } = {},
) {
  let result = parts.slice();

  if (inStockOnly) {
    result = result.filter((part) => part.totalStock > 0);
  }

  const normalizedText = text.trim().toLowerCase();
  if (normalizedText) {
    const words = normalizedText.split(/\s+/);
    result = result.filter((part) => {
      const haystack = `${part.brand} ${part.name} ${part.number}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }

  if (sort === SORT.PRICE_ASC) {
    result.sort((a, b) => compareByPrice(a, b, 1));
  } else if (sort === SORT.PRICE_DESC) {
    result.sort((a, b) => compareByPrice(a, b, -1));
  } else if (sort === SORT.STOCK_DESC) {
    result.sort((a, b) => {
      const byStock = b.totalStock - a.totalStock;
      if (byStock !== 0) {
        return byStock;
      }
      return compareByBrandThenNumber(a, b);
    });
  }

  return result;
}
