import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../features/offers/actions.js';
import {
  selectOffersAnalogues,
  selectOffersError,
  selectOffersIsEmpty,
  selectOffersQuery,
  selectOffersRequested,
  selectOffersStatus,
} from '../features/offers/selectors.js';
import { STATUS } from '../store/helpers.js';

/** Константный пустой список аналогов для неактуального состояния. */
const EMPTY_ANALOGUES = [];

/**
 * Загружает и отдаёт состояние предложений этапа 2 для пары number + brand из URL.
 * @param {string} number — уже обрезанный номер детали (может быть '')
 * @param {string} brand — бренд из URL как есть, без trim (может быть '')
 * @returns {{
 *   status: 'idle'|'loading'|'succeeded'|'failed',
 *   error: { kind: string, message: string }|null,
 *   isEmpty: boolean,
 *   requested: import('../api/normalizers.js').Part|null,
 *   analogues: import('../api/normalizers.js').Part[],
 *   retry: () => void
 * }}
 */
export function useOffers(number, brand) {
  const dispatch = useDispatch();
  const storeStatus = useSelector(selectOffersStatus);
  const error = useSelector(selectOffersError);
  const storeIsEmpty = useSelector(selectOffersIsEmpty);
  const query = useSelector(selectOffersQuery);
  const storeRequested = useSelector(selectOffersRequested);
  const storeAnalogues = useSelector(selectOffersAnalogues);

  useEffect(() => {
    dispatch(fetchOffers(number, brand));
  }, [dispatch, number, brand]);

  const retry = useCallback(() => {
    dispatch(fetchOffers(number, brand));
  }, [dispatch, number, brand]);

  if (number === '' || brand === '') {
    return {
      status: STATUS.IDLE,
      error: null,
      isEmpty: false,
      requested: null,
      analogues: EMPTY_ANALOGUES,
      retry,
    };
  }

  const isCurrent = query?.number === number && query?.brand === brand;
  if (!isCurrent) {
    return {
      status: STATUS.LOADING,
      error: null,
      isEmpty: false,
      requested: null,
      analogues: EMPTY_ANALOGUES,
      retry,
    };
  }

  return {
    status: storeStatus,
    error,
    isEmpty: storeIsEmpty,
    requested: storeRequested,
    analogues: storeAnalogues,
    retry,
  };
}
