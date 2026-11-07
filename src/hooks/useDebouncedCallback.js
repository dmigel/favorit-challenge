import { useEffect, useMemo, useRef } from 'react';

/**
 * Возвращает debounced-обёртку над callback: вызов откладывается на delay мс
 * после последнего вызова; отложенный вызов можно отменить через .cancel().
 * @template {(...args: unknown[]) => void} T
 * @param {T} callback — функция, которую нужно вызывать с задержкой
 * @param {number} delay — задержка в миллисекундах
 * @returns {((...args: Parameters<T>) => void) & { cancel: () => void }}
 */
export function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return useMemo(() => {
    /**
     * Планирует вызов актуального callback с переданными аргументами.
     * @param {...unknown} args
     */
    function debounced(...args) {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
      }, delay);
    }

    /**
     * Отменяет отложенный вызов, если он ещё не выполнился.
     */
    debounced.cancel = () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    return debounced;
  }, [delay]);
}
