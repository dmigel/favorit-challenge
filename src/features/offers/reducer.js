import { isSameQuery, STATUS } from '../../store/helpers.js';
import { OFFERS, OFFERS_RESET } from './actionTypes.js';

/**
 * Состояние этапа 2: запрошенная деталь и аналоги.
 * @typedef {object} OffersState
 * @property {'idle'|'loading'|'succeeded'|'failed'} status
 * @property {{ number: string, brand: string }|null} query
 * @property {import('../../api/normalizers.js').Part|null} requested
 * @property {import('../../api/normalizers.js').Part[]} analogues
 * @property {{ kind: string, message: string }|null} error
 */

/**
 * Начальное состояние среза offers.
 * @type {OffersState}
 */
export const initialState = {
  status: STATUS.IDLE,
  query: null,
  requested: null,
  analogues: [],
  error: null,
};

/**
 * Редьюсер этапа 2 (предложения и аналоги).
 * @param {OffersState} state
 * @param {{ type: string, query?: { number: string, brand: string }, payload?: import('../../api/normalizers.js').OffersResult, error?: { kind: string, message: string } }} action
 * @returns {OffersState}
 */
export default function offersReducer(state = initialState, action) {
  switch (action.type) {
    case OFFERS.REQUEST:
      return {
        ...state,
        status: STATUS.LOADING,
        query: action.query,
        requested: null,
        analogues: [],
        error: null,
      };

    case OFFERS.SUCCESS:
      if (!isSameQuery(action.query, state.query)) {
        return state;
      }
      return {
        ...state,
        status: STATUS.SUCCEEDED,
        requested: action.payload.requested,
        analogues: action.payload.analogues,
        error: null,
      };

    case OFFERS.FAILURE:
      if (!isSameQuery(action.query, state.query)) {
        return state;
      }
      return {
        ...state,
        status: STATUS.FAILED,
        error: action.error,
      };

    case OFFERS_RESET:
      return initialState;

    default:
      return state;
  }
}
