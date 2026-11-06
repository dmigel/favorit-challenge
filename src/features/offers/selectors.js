import { STATUS } from '../../store/helpers.js';

/**
 * Статус загрузки предложений.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {'idle'|'loading'|'succeeded'|'failed'}
 */
export function selectOffersStatus(state) {
  return state.offers.status;
}

/**
 * Запрошенная деталь этапа 2.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {import('../../api/normalizers.js').Part|null}
 */
export function selectOffersRequested(state) {
  return state.offers.requested;
}

/**
 * Список аналогов.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {import('../../api/normalizers.js').Part[]}
 */
export function selectOffersAnalogues(state) {
  return state.offers.analogues;
}

/**
 * Ошибка загрузки предложений.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {{ kind: string, message: string }|null}
 */
export function selectOffersError(state) {
  return state.offers.error;
}

/**
 * Текущий запрос предложений.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {{ number: string, brand: string }|null}
 */
export function selectOffersQuery(state) {
  return state.offers.query;
}

/**
 * Признак пустого успешного результата этапа 2.
 * @param {{ offers: import('./reducer.js').OffersState }} state
 * @returns {boolean}
 */
export function selectOffersIsEmpty(state) {
  return (
    state.offers.status === STATUS.SUCCEEDED &&
    state.offers.requested === null &&
    state.offers.analogues.length === 0
  );
}
