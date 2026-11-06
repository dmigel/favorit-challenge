import * as api from '../../api/partsApi.js';
import { isSameQuery, STATUS, toSerializableError } from '../../store/helpers.js';
import { OFFERS, OFFERS_RESET } from './actionTypes.js';

/**
 * Экшен начала загрузки предложений.
 * @param {{ number: string, brand: string }} query
 * @returns {{ type: string, query: { number: string, brand: string } }}
 */
export function offersRequest(query) {
  return { type: OFFERS.REQUEST, query };
}

/**
 * Экшен успешной загрузки предложений.
 * @param {{ number: string, brand: string }} query
 * @param {import('../../api/normalizers.js').OffersResult} result
 * @returns {{ type: string, query: { number: string, brand: string }, payload: import('../../api/normalizers.js').OffersResult }}
 */
export function offersSuccess(query, result) {
  return { type: OFFERS.SUCCESS, query, payload: result };
}

/**
 * Экшен ошибки загрузки предложений.
 * @param {{ number: string, brand: string }} query
 * @param {{ kind: string, message: string }} error
 * @returns {{ type: string, query: { number: string, brand: string }, error: { kind: string, message: string } }}
 */
export function offersFailure(query, error) {
  return { type: OFFERS.FAILURE, query, error };
}

/**
 * Экшен сброса состояния предложений.
 * @returns {{ type: string }}
 */
export function offersReset() {
  return { type: OFFERS_RESET };
}

/**
 * Thunk: загружает запрошенную деталь и аналоги по номеру и бренду.
 * @param {string} number
 * @param {string} brand
 * @returns {function(Function, Function): Promise<void>}
 */
export function fetchOffers(number, brand) {
  return async (dispatch, getState) => {
    const query = { number: String(number ?? '').trim(), brand: brand ?? '' };

    if (!query.number || !query.brand) {
      dispatch(offersReset());
      return;
    }

    const { offers } = getState();
    if (
      isSameQuery(query, offers.query) &&
      (offers.status === STATUS.LOADING || offers.status === STATUS.SUCCEEDED)
    ) {
      return;
    }

    dispatch(offersRequest(query));

    try {
      const result = await api.fetchOffers(query.number, query.brand);
      dispatch(offersSuccess(query, result));
    } catch (error) {
      dispatch(offersFailure(query, toSerializableError(error)));
    }
  };
}
