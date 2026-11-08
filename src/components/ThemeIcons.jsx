/**
 * Общие SVG-атрибуты иконок темы.
 * @param {string} [className]
 * @returns {{ width: number, height: number, fill: string, 'aria-hidden': string, focusable: string, className?: string }}
 */
function iconProps(className) {
  return {
    width: 16,
    height: 16,
    fill: 'currentColor',
    'aria-hidden': 'true',
    focusable: 'false',
    ...(className ? { className } : {}),
  };
}

/**
 * Иконка солнца (светлая тема).
 * @param {{ className?: string }} [props]
 */
export function SunIcon({ className } = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...iconProps(className)}
    >
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3 11a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1ZM5.64 5.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41Zm10.61 10.61a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41ZM18.36 5.64a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM7.05 16.95a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0Z" />
    </svg>
  );
}

/**
 * Иконка луны (тёмная тема).
 * @param {{ className?: string }} [props]
 */
export function MoonIcon({ className } = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...iconProps(className)}
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

/**
 * Иконка «половина круга» для кнопки выбора темы.
 * @param {{ className?: string }} [props]
 */
export function CircleHalfIcon({ className } = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      {...iconProps(className)}
    >
      <path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16" />
    </svg>
  );
}
