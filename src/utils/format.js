const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
});

/**
 * Форматирует число как цену в рублях.
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatPrice(value) {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }

  return rubFormatter.format(value);
}
