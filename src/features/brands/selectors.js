import { STATUS } from '../../store/helpers.js';

/**
 * Статус загрузки производителей.
 * @param {{ brands: import('./reducer.js').BrandsState }} state
 * @returns {'idle'|'loading'|'succeeded'|'failed'}
 */
export function selectBrandsStatus(state) {
  return state.brands.status;
}

/**
 * Список производителей.
 * @param {{ brands: import('./reducer.js').BrandsState }} state
 * @returns {import('../../api/normalizers.js').Part[]}
 */
export function selectBrandsItems(state) {
  return state.brands.items;
}

/**
 * Ошибка загрузки производителей.
 * @param {{ brands: import('./reducer.js').BrandsState }} state
 * @returns {{ kind: string, message: string }|null}
 */
export function selectBrandsError(state) {
  return state.brands.error;
}

/**
 * Текущий запрос производителей.
 * @param {{ brands: import('./reducer.js').BrandsState }} state
 * @returns {{ number: string }|null}
 */
export function selectBrandsQuery(state) {
  return state.brands.query;
}

/**
 * Признак пустого успешного результата этапа 1.
 * @param {{ brands: import('./reducer.js').BrandsState }} state
 * @returns {boolean}
 */
export function selectBrandsIsEmpty(state) {
  return state.brands.status === STATUS.SUCCEEDED && state.brands.items.length === 0;
}
