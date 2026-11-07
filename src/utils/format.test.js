import { describe, expect, it } from 'vitest';
import { formatPrice } from './format.js';

/**
 * Нормализует пробелы Intl-строки для стабильного сравнения.
 * @param {string} value
 * @returns {string}
 */
function normalizeSpaces(value) {
  return value.replace(/\s/g, ' ');
}

describe('formatPrice', () => {
  it('форматирует суммы в рублях', () => {
    expect(normalizeSpaces(formatPrice(1032))).toBe('1 032,00 ₽');
    expect(normalizeSpaces(formatPrice(548.4))).toBe('548,40 ₽');
    expect(normalizeSpaces(formatPrice(23580.74))).toBe('23 580,74 ₽');
  });

  it('для null возвращает тире', () => {
    expect(formatPrice(null)).toBe('—');
  });
});
