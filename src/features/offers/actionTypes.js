import { createRequestTypes } from '../../store/helpers.js';

/** Типы асинхронных экшенов этапа 2 (предложения и аналоги). */
export const OFFERS = createRequestTypes('OFFERS');

/** Сброс состояния предложений. */
export const OFFERS_RESET = 'OFFERS/RESET';
