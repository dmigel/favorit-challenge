import { isSameQuery, STATUS } from '../../store/helpers.js';
import { BRANDS, BRANDS_RESET } from './actionTypes.js';

/**
 * Состояние этапа 1: список производителей по номеру детали.
 * @typedef {object} BrandsState
 * @property {'idle'|'loading'|'succeeded'|'failed'} status
 * @property {{ number: string }|null} query
 * @property {import('../../api/normalizers.js').Part[]} items
 * @property {{ kind: string, message: string }|null} error
 */

/**
 * Начальное состояние среза brands.
 * @type {BrandsState}
 */
export const initialState = {
  status: STATUS.IDLE,
  query: null,
  items: [],
  error: null,
};

/**
 * Редьюсер этапа 1 (производители).
 * @param {BrandsState} state
 * @param {{ type: string, query?: { number: string }, payload?: import('../../api/normalizers.js').Part[], error?: { kind: string, message: string } }} action
 * @returns {BrandsState}
 */
export default function brandsReducer(state = initialState, action) {
  switch (action.type) {
    case BRANDS.REQUEST:
      return {
        ...state,
        status: STATUS.LOADING,
        query: action.query,
        items: [],
        error: null,
      };

    case BRANDS.SUCCESS:
      if (!isSameQuery(action.query, state.query)) {
        return state;
      }
      return {
        ...state,
        status: STATUS.SUCCEEDED,
        items: action.payload,
        error: null,
      };

    case BRANDS.FAILURE:
      if (!isSameQuery(action.query, state.query)) {
        return state;
      }
      return {
        ...state,
        status: STATUS.FAILED,
        error: action.error,
      };

    case BRANDS_RESET:
      return initialState;

    default:
      return state;
  }
}
