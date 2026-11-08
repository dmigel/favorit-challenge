import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Хук выпадающего меню: открытие/закрытие, клик снаружи и Escape.
 * @returns {{
 *   isOpen: boolean,
 *   toggle: () => void,
 *   close: () => void,
 *   containerRef: import('react').RefObject<HTMLElement | null>,
 *   toggleRef: import('react').RefObject<HTMLElement | null>
 * }}
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const toggleRef = useRef(null);

  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    /**
     * Закрывает меню при mousedown вне контейнера (без возврата фокуса).
     * @param {MouseEvent} event
     */
    function handleMouseDown(event) {
      const container = containerRef.current;
      if (container && !container.contains(event.target)) {
        setIsOpen(false);
      }
    }

    /**
     * Закрывает меню по Escape и возвращает фокус на кнопку-переключатель.
     * @param {KeyboardEvent} event
     */
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return { isOpen, toggle, close, containerRef, toggleRef };
}
