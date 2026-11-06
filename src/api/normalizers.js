/**
 * Складское предложение с остатком.
 * @typedef {object} Offer
 * @property {string} id
 * @property {string} code
 * @property {boolean} own
 * @property {number} price
 * @property {number} stock
 * @property {string} shipmentDate
 * @property {boolean} notRefund
 */

/**
 * Нормализованная позиция (запчасть).
 * @typedef {object} Part
 * @property {string} id
 * @property {string} brand
 * @property {string} number
 * @property {string} name
 * @property {number} totalStock
 * @property {number|null} minPrice
 * @property {boolean} notRefund
 * @property {Offer[]} offers
 */

/**
 * Результат этапа 2: запрошенная деталь и аналоги.
 * @typedef {object} OffersResult
 * @property {Part|null} requested
 * @property {Part[]} analogues
 */

/** goodsID «пустой» позиции «не найдено». */
const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Проверяет, является ли элемент сырого ответа пустой структурой «не найдено».
 * @param {object|null|undefined} item
 * @returns {boolean}
 */
export function isEmptyItem(item) {
  if (!item) {
    return true;
  }

  if (item.goodsID === EMPTY_GOODS_ID) {
    return true;
  }

  return !item.brand && !item.name && !item.number;
}

/**
 * Нормализует склад с остатком в Offer.
 * @param {object} warehouse
 * @returns {Offer}
 */
function normalizeOffer(warehouse) {
  return {
    id: warehouse.id,
    code: warehouse.code,
    own: Boolean(warehouse.own),
    price: warehouse.price,
    stock: warehouse.stock,
    shipmentDate: warehouse.shipmentDate,
    notRefund: Boolean(warehouse.notRefund),
  };
}

/**
 * Нормализует сырой Item API в Part.
 * @param {object} item
 * @returns {Part}
 */
function normalizePart(item) {
  const offers = (item.warehouses ?? [])
    .filter((warehouse) => warehouse.stock > 0)
    .map(normalizeOffer)
    .sort((a, b) => a.price - b.price);

  return {
    id: item.goodsID,
    brand: item.brand ?? '',
    number: item.number ?? '',
    name: item.name ?? '',
    totalStock: item.count ?? 0,
    minPrice: offers[0]?.price ?? null,
    notRefund: Boolean(item.notRefund),
    offers,
  };
}

/**
 * Нормализует ответ этапа 1 в список уникальных брендов.
 * @param {object[]} goods
 * @returns {Part[]}
 */
export function normalizeBrands(goods) {
  if (!Array.isArray(goods) || goods.length === 0) {
    return [];
  }

  const seenBrands = new Set();
  const parts = [];

  for (const item of goods) {
    if (isEmptyItem(item)) {
      continue;
    }
    if (seenBrands.has(item.brand)) {
      continue;
    }
    seenBrands.add(item.brand);
    parts.push(normalizePart(item));
  }

  return parts.sort((a, b) => {
    const aStockRank = a.totalStock > 0 ? 0 : 1;
    const bStockRank = b.totalStock > 0 ? 0 : 1;
    if (aStockRank !== bStockRank) {
      return aStockRank - bStockRank;
    }
    return a.brand.localeCompare(b.brand, 'ru');
  });
}

/**
 * Нормализует ответ этапа 2: запрошенная деталь и аналоги.
 * @param {object[]} goods
 * @returns {OffersResult}
 */
export function normalizeOffers(goods) {
  if (!Array.isArray(goods) || goods.length === 0) {
    return { requested: null, analogues: [] };
  }

  const item = goods[0];
  const rawAnalogues = item.analogues ?? [];

  if (isEmptyItem(item) && rawAnalogues.length === 0) {
    return { requested: null, analogues: [] };
  }

  const requested = isEmptyItem(item) ? null : normalizePart(item);

  const seenIds = new Set();
  const analogues = [];

  for (const analogue of rawAnalogues) {
    if (isEmptyItem(analogue)) {
      continue;
    }
    if (seenIds.has(analogue.goodsID)) {
      continue;
    }
    seenIds.add(analogue.goodsID);
    analogues.push(normalizePart(analogue));
  }

  return { requested, analogues };
}
