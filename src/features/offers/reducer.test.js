import { describe, expect, it } from 'vitest';
import { STATUS } from '../../store/helpers.js';
import { OFFERS, OFFERS_RESET } from './actionTypes.js';
import offersReducer, { initialState } from './reducer.js';

const query = { number: '7160500039S', brand: 'MEYLE' };
const requested = { id: '1', brand: 'MEYLE', number: '7160500039S' };
const analogues = [{ id: '2', brand: 'OTHER', number: 'X' }];

describe('offersReducer', () => {
  it('возвращает initialState по умолчанию', () => {
    expect(offersReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('REQUEST переводит в loading и очищает данные', () => {
    const prev = {
      status: STATUS.SUCCEEDED,
      query: { number: 'old', brand: 'OLD' },
      requested,
      analogues,
      error: { kind: 'api', message: 'x' },
    };

    expect(
      offersReducer(Object.freeze(prev), { type: OFFERS.REQUEST, query }),
    ).toEqual({
      status: STATUS.LOADING,
      query,
      requested: null,
      analogues: [],
      error: null,
    });
  });

  it('SUCCESS сохраняет requested и analogues при совпадающем query', () => {
    const state = {
      status: STATUS.LOADING,
      query,
      requested: null,
      analogues: [],
      error: null,
    };

    expect(
      offersReducer(Object.freeze(state), {
        type: OFFERS.SUCCESS,
        query,
        payload: { requested, analogues },
      }),
    ).toEqual({
      status: STATUS.SUCCEEDED,
      query,
      requested,
      analogues,
      error: null,
    });
  });

  it('FAILURE сохраняет error при совпадающем query', () => {
    const state = {
      status: STATUS.LOADING,
      query,
      requested: null,
      analogues: [],
      error: null,
    };
    const error = { kind: 'http', message: 'Сервер вернул ошибку 500' };

    expect(
      offersReducer(Object.freeze(state), {
        type: OFFERS.FAILURE,
        query,
        error,
      }),
    ).toEqual({
      status: STATUS.FAILED,
      query,
      requested: null,
      analogues: [],
      error,
    });
  });

  it('RESET возвращает initialState', () => {
    const state = {
      status: STATUS.SUCCEEDED,
      query,
      requested,
      analogues,
      error: null,
    };

    expect(offersReducer(Object.freeze(state), { type: OFFERS_RESET })).toBe(
      initialState,
    );
  });

  it('игнорирует устаревший SUCCESS', () => {
    const state = {
      status: STATUS.LOADING,
      query: { number: 'new', brand: 'NEW' },
      requested: null,
      analogues: [],
      error: null,
    };

    expect(
      offersReducer(Object.freeze(state), {
        type: OFFERS.SUCCESS,
        query,
        payload: { requested, analogues },
      }),
    ).toBe(state);
  });

  it('игнорирует устаревший FAILURE', () => {
    const state = {
      status: STATUS.LOADING,
      query: { number: 'new', brand: 'NEW' },
      requested: null,
      analogues: [],
      error: null,
    };

    expect(
      offersReducer(Object.freeze(state), {
        type: OFFERS.FAILURE,
        query,
        error: { kind: 'api', message: 'x' },
      }),
    ).toBe(state);
  });

  it('неизвестный экшен возвращает тот же state', () => {
    const state = Object.freeze({ ...initialState });
    expect(offersReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  it('не мутирует переданный state', () => {
    const state = Object.freeze({
      status: STATUS.IDLE,
      query: null,
      requested: null,
      analogues: Object.freeze([]),
      error: null,
    });

    expect(() =>
      offersReducer(state, { type: OFFERS.REQUEST, query }),
    ).not.toThrow();
  });
});
