import { ApiError } from '../api/ApiError.js';
import { UNKNOWN_ERROR_MESSAGE } from '../utils/constants.js';

/**
 * Статусы асинхронных срезов состояния.
 * @readonly
 */
export const STATUS = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

/**
 * Создаёт тройку типов экшенов REQUEST / SUCCESS / FAILURE для базового имени.
 * @param {string} base
 * @returns {{ REQUEST: string, SUCCESS: string, FAILURE: string }}
 */
export function createRequestTypes(base) {
  return {
    REQUEST: `${base}/REQUEST`,
    SUCCESS: `${base}/SUCCESS`,
    FAILURE: `${base}/FAILURE`,
  };
}

/**
 * Поверхностно сравнивает два объекта-запроса.
 * Если любой из аргументов null/undefined — возвращает false.
 * @param {Record<string, unknown>|null|undefined} a
 * @param {Record<string, unknown>|null|undefined} b
 * @returns {boolean}
 */
export function isSameQuery(a, b) {
  if (a == null || b == null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Превращает ошибку в сериализуемый объект для Redux-состояния.
 * @param {unknown} error
 * @returns {{ kind: string, message: string }}
 */
export function toSerializableError(error) {
  if (error instanceof ApiError) {
    return {
      kind: error.kind,
      message: error.message,
    };
  }

  return {
    kind: 'unknown',
    message: UNKNOWN_ERROR_MESSAGE,
  };
}
