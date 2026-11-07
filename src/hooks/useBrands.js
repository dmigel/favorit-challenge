import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../features/brands/actions.js';
import {
  selectBrandsError,
  selectBrandsIsEmpty,
  selectBrandsQuery,
  selectBrandsStatus,
} from '../features/brands/selectors.js';
import { STATUS } from '../store/helpers.js';

/**
 * Загружает и отдаёт состояние производителей для номера из URL.
 * @param {string} number — уже обрезанный номер детали (может быть '')
 * @returns {{
 *   status: 'idle'|'loading'|'succeeded'|'failed',
 *   error: { kind: string, message: string }|null,
 *   isEmpty: boolean,
 *   retry: () => void
 * }}
 */
export function useBrands(number) {
  const dispatch = useDispatch();
  const storeStatus = useSelector(selectBrandsStatus);
  const error = useSelector(selectBrandsError);
  const storeIsEmpty = useSelector(selectBrandsIsEmpty);
  const query = useSelector(selectBrandsQuery);

  useEffect(() => {
    dispatch(fetchBrands(number));
  }, [dispatch, number]);

  const retry = useCallback(() => {
    dispatch(fetchBrands(number));
  }, [dispatch, number]);

  if (number === '') {
    return {
      status: STATUS.IDLE,
      error: null,
      isEmpty: false,
      retry,
    };
  }

  const isCurrent = query?.number === number;
  const status = isCurrent ? storeStatus : STATUS.LOADING;
  const isEmpty = isCurrent && storeIsEmpty;

  return {
    status,
    error: isCurrent ? error : null,
    isEmpty,
    retry,
  };
}
