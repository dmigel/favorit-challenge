import { useDropdown } from '../hooks/useDropdown.js';
import { useTheme } from '../hooks/useTheme.js';
import { CircleHalfIcon, MoonIcon, SunIcon } from './ThemeIcons.jsx';

const THEME_OPTIONS = [
  { value: 'light', label: 'Светлая', Icon: SunIcon },
  { value: 'dark', label: 'Тёмная', Icon: MoonIcon },
];

/**
 * Выпадающий выбор светлой/тёмной темы в шапке.
 */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dropdown = useDropdown();
  const { isOpen, toggle, containerRef, toggleRef } = dropdown;

  /**
   * Выбирает тему, закрывает меню и возвращает фокус на кнопку.
   * @param {'light' | 'dark'} value
   */
  function handleSelect(value) {
    setTheme(value);
    dropdown.close();
    dropdown.toggleRef.current?.focus();
  }

  return (
    <div className="dropdown ms-auto" ref={containerRef}>
      <button
        type="button"
        id="theme-menu"
        ref={toggleRef}
        className="btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center"
        aria-label="Выбрать тему оформления"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <CircleHalfIcon />
      </button>
      <ul
        className={`dropdown-menu dropdown-menu-end${isOpen ? ' show' : ''}`}
        data-bs-popper="static"
        aria-labelledby="theme-menu"
      >
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <li key={value}>
            <button
              type="button"
              className="dropdown-item d-flex align-items-center"
              aria-pressed={theme === value}
              onClick={() => handleSelect(value)}
            >
              <Icon />
              <span className="ms-2">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThemeToggle;
