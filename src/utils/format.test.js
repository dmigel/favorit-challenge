import { describe, expect, it } from 'vitest';
import { formatPrice, formatShipment } from './format.js';

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

describe('formatShipment', () => {
  it('форматирует дату и время по Москве', () => {
    const result = normalizeSpaces(
      formatShipment('2026-11-09T15:30:00+03:00'),
    );

    expect(result).toContain('9');
    expect(result).toContain('нояб');
    expect(result).toContain('15:30');
    expect(result).toContain('МСК');
  });

  it('переводит UTC в московское время независимо от TZ машины', () => {
    const result = normalizeSpaces(
      formatShipment('2026-11-09T12:30:00+00:00'),
    );

    expect(result).toContain('15:30');
  });

  it('показывает 00:05, а не 24:05', () => {
    const result = normalizeSpaces(
      formatShipment('2026-11-09T00:05:00+03:00'),
    );

    expect(result).toContain('00:05');
    expect(result).not.toContain('24:05');
  });

  it('для пустых и невалидных значений возвращает тире', () => {
    expect(formatShipment(null)).toBe('—');
    expect(formatShipment('')).toBe('—');
    expect(formatShipment('garbage')).toBe('—');
  });
});
