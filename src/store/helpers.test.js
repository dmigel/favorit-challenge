import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/ApiError.js';
import { createRequestTypes, isSameQuery, toSerializableError } from './helpers.js';

describe('createRequestTypes', () => {
  it('собирает REQUEST / SUCCESS / FAILURE от базового имени', () => {
    expect(createRequestTypes('BRANDS')).toEqual({
      REQUEST: 'BRANDS/REQUEST',
      SUCCESS: 'BRANDS/SUCCESS',
      FAILURE: 'BRANDS/FAILURE',
    });
  });
});

describe('isSameQuery', () => {
  it('возвращает true для одинаковых объектов', () => {
    expect(isSameQuery({ number: '0189' }, { number: '0189' })).toBe(true);
    expect(
      isSameQuery({ number: '1', brand: 'A' }, { number: '1', brand: 'A' }),
    ).toBe(true);
  });

  it('возвращает false для разных объектов', () => {
    expect(isSameQuery({ number: '0189' }, { number: '0190' })).toBe(false);
    expect(
      isSameQuery({ number: '1', brand: 'A' }, { number: '1', brand: 'B' }),
    ).toBe(false);
    expect(isSameQuery({ number: '1' }, { number: '1', brand: 'A' })).toBe(false);
  });

  it('возвращает false, если любой аргумент null', () => {
    expect(isSameQuery(null, { number: '0189' })).toBe(false);
    expect(isSameQuery({ number: '0189' }, null)).toBe(false);
    expect(isSameQuery(null, null)).toBe(false);
  });
});

describe('toSerializableError', () => {
  it('сериализует ApiError в { kind, message }', () => {
    const error = new ApiError('network');
    expect(toSerializableError(error)).toEqual({
      kind: 'network',
      message: 'Нет соединения с сервером',
    });
  });

  it('для обычной Error возвращает unknown', () => {
    expect(toSerializableError(new Error('boom'))).toEqual({
      kind: 'unknown',
      message: 'Неизвестная ошибка',
    });
  });
});
