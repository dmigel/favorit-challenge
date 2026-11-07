import { describe, expect, it } from 'vitest';
import { buildOffersPath, buildSearchPath } from './routes.js';

describe('buildSearchPath', () => {
  it('собирает путь с номером', () => {
    expect(buildSearchPath('0189')).toBe('/?number=0189');
  });

  it('для пустого и undefined возвращает корень', () => {
    expect(buildSearchPath('')).toBe('/');
    expect(buildSearchPath(undefined)).toBe('/');
  });

  it('корректно кодирует номер со спецсимволами', () => {
    const number = 'A#B&C/1';
    const path = buildSearchPath(number);
    const params = new URLSearchParams(path.slice(path.indexOf('?') + 1));

    expect(params.get('number')).toBe(number);
  });
});

describe('buildOffersPath', () => {
  it('собирает путь с номером и брендом', () => {
    expect(buildOffersPath('0189', 'CAFFARO')).toBe('/offers?number=0189&brand=CAFFARO');
  });

  it('кодирует бренд NGK/NTK и сохраняет исходное значение после разбора', () => {
    const path = buildOffersPath('0189', 'NGK/NTK');
    const params = new URLSearchParams(path.slice(path.indexOf('?') + 1));

    expect(path).toContain('brand=NGK%2FNTK');
    expect(params.get('brand')).toBe('NGK/NTK');
  });

  it('корректно кодирует номер со спецсимволами', () => {
    const number = 'A#B&C/1';
    const path = buildOffersPath(number, 'CAFFARO');
    const params = new URLSearchParams(path.slice(path.indexOf('?') + 1));

    expect(params.get('number')).toBe(number);
    expect(params.get('brand')).toBe('CAFFARO');
  });
});
