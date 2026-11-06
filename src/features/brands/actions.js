import * as api from '../../api/partsApi.js';
import { isSameQuery, STATUS, toSerializableError } from '../../store/helpers.js';
import { BRANDS, BRANDS_RESET } from './actionTypes.js';

/**
 * Экшен начала загрузки производителей.
 * @param {{ number: string }} query
 * @returns {{ type: string, query: { number: string } }}
 */
export function brandsRequest(query) {
  return { type: BRANDS.REQUEST, query };
}

/**
 * Экшен успешной загрузки производителей.
 * @param {{ number: string }} query
 * @param {import('../../api/normalizers.js').Part[]} items
 * @returns {{ type: string, query: { number: string }, payload: import('../../api/normalizers.js').Part[] }}
 */
export function brandsSuccess(query, items) {
  return { type: BRANDS.SUCCESS, query, payload: items };
}

/**
 * Экшен ошибки загрузки производителей.
 * @param {{ number: string }} query
 * @param {{ kind: string, message: string }} error
 * @returns {{ type: string, query: { number: string }, error: { kind: string, message: string } }}
 */
export function brandsFailure(query, error) {
  return { type: BRANDS.FAILURE, query, error };
}

/**
 * Экшен сброса состояния брендов.
 * @returns {{ type: string }}
 */
export function brandsReset() {
  return { type: BRANDS_RESET };
}

/**
 * Thunk: загружает производителей по номеру детали.
 * @param {string} number
 * @returns {function(Function, Function): Promise<void>}
 */
export function fetchBrands(number) {
  return async (dispatch, getState) => {
    const query = { number: String(number).trim() };

    if (!query.number) {
      dispatch(brandsReset());
      return;
    }

    const { brands } = getState();
    if (
      isSameQuery(query, brands.query) &&
      (brands.status === STATUS.LOADING || brands.status === STATUS.SUCCEEDED)
    ) {
      return;
    }

    dispatch(brandsRequest(query));

    try {
      const items = await api.fetchBrands(query.number);
      dispatch(brandsSuccess(query, items));
    } catch (error) {
      dispatch(brandsFailure(query, toSerializableError(error)));
    }
  };
}
