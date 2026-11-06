import { describe, expect, it } from 'vitest';
import { STATUS } from '../../store/helpers.js';
import { BRANDS, BRANDS_RESET } from './actionTypes.js';
import brandsReducer, { initialState } from './reducer.js';

const sampleItems = [{ id: '1', brand: 'ZEN', number: '0189' }];
const query = { number: '0189' };

describe('brandsReducer', () => {
  it('возвращает initialState по умолчанию', () => {
    expect(brandsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('REQUEST переводит в loading и очищает данные', () => {
    const prev = {
      status: STATUS.SUCCEEDED,
      query: { number: 'old' },
      items: sampleItems,
      error: { kind: 'api', message: 'x' },
    };

    expect(
      brandsReducer(Object.freeze(prev), { type: BRANDS.REQUEST, query }),
    ).toEqual({
      status: STATUS.LOADING,
      query,
      items: [],
      error: null,
    });
  });

  it('SUCCESS сохраняет items при совпадающем query', () => {
    const state = {
      status: STATUS.LOADING,
      query,
      items: [],
      error: null,
    };

    expect(
      brandsReducer(Object.freeze(state), {
        type: BRANDS.SUCCESS,
        query,
        payload: sampleItems,
      }),
    ).toEqual({
      status: STATUS.SUCCEEDED,
      query,
      items: sampleItems,
      error: null,
    });
  });

  it('FAILURE сохраняет error при совпадающем query', () => {
    const state = {
      status: STATUS.LOADING,
      query,
      items: [],
      error: null,
    };
    const error = { kind: 'network', message: 'Нет соединения с сервером' };

    expect(
      brandsReducer(Object.freeze(state), {
        type: BRANDS.FAILURE,
        query,
        error,
      }),
    ).toEqual({
      status: STATUS.FAILED,
      query,
      items: [],
      error,
    });
  });

  it('RESET возвращает initialState', () => {
    const state = {
      status: STATUS.SUCCEEDED,
      query,
      items: sampleItems,
      error: null,
    };

    expect(brandsReducer(Object.freeze(state), { type: BRANDS_RESET })).toBe(
      initialState,
    );
  });

  it('игнорирует устаревший SUCCESS', () => {
    const state = {
      status: STATUS.LOADING,
      query: { number: 'new' },
      items: [],
      error: null,
    };

    expect(
      brandsReducer(Object.freeze(state), {
        type: BRANDS.SUCCESS,
        query: { number: 'old' },
        payload: sampleItems,
      }),
    ).toBe(state);
  });

  it('игнорирует устаревший FAILURE', () => {
    const state = {
      status: STATUS.LOADING,
      query: { number: 'new' },
      items: [],
      error: null,
    };

    expect(
      brandsReducer(Object.freeze(state), {
        type: BRANDS.FAILURE,
        query: { number: 'old' },
        error: { kind: 'api', message: 'x' },
      }),
    ).toBe(state);
  });

  it('неизвестный экшен возвращает тот же state', () => {
    const state = Object.freeze({ ...initialState });
    expect(brandsReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  it('не мутирует переданный state', () => {
    const state = Object.freeze({
      status: STATUS.IDLE,
      query: null,
      items: Object.freeze([]),
      error: null,
    });

    expect(() =>
      brandsReducer(state, { type: BRANDS.REQUEST, query }),
    ).not.toThrow();
  });
});
