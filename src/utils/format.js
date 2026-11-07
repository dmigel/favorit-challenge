const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
});

const shipmentDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: 'numeric',
  month: 'short',
});

const shipmentTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
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

/**
 * Форматирует дату отгрузки склада (день + крайний час заказа по Москве).
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
export function formatShipment(isoString) {
  if (!isoString) {
    return '—';
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const dayMonth = shipmentDateFormatter.format(date);
  const time = shipmentTimeFormatter.format(date);

  return `Отгрузка ${dayMonth}, заказ до ${time} МСК`;
}
