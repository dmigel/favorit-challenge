/**
 * Пауза перед автопоиском после последнего ввода (мс).
 * Нужна, чтобы не слать запрос на каждый символ и уложиться в квоту API.
 */
export const SEARCH_DEBOUNCE_MS = 500;

/**
 * Минимальная длина обрезанного номера для автопоиска.
 * Короче — запрос не запускается (можно искать только по кнопке/Enter при ≥1 символе).
 */
export const MIN_SEARCH_LENGTH = 3;

/**
 * Число позиций, показываемых за один шаг «Показать ещё».
 */
export const PAGE_SIZE = 20;

/**
 * Значения сортировки списка аналогов этапа 2.
 * @readonly
 */
export const SORT = Object.freeze({
  /** По возрастанию минимальной цены. */
  PRICE_ASC: 'price-asc',
  /** По убыванию минимальной цены. */
  PRICE_DESC: 'price-desc',
  /** По убыванию суммарного остатка. */
  STOCK_DESC: 'stock-desc',
});

/**
 * Варианты сортировки для UI (value + русская подпись).
 */
export const SORT_OPTIONS = [
  { value: SORT.PRICE_ASC, label: 'Сначала дешевле' },
  { value: SORT.PRICE_DESC, label: 'Сначала дороже' },
  { value: SORT.STOCK_DESC, label: 'Сначала с большим остатком' },
];
