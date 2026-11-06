import { createRequestTypes } from '../../store/helpers.js';

/** Типы асинхронных экшенов этапа 1 (производители). */
export const BRANDS = createRequestTypes('BRANDS');

/** Сброс состояния брендов. */
export const BRANDS_RESET = 'BRANDS/RESET';
