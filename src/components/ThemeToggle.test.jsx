import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

describe('ThemeToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    localStorage.clear();
  });

  it('кнопка выбора темы закрыта по умолчанию', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Выбрать тему оформления' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('клик открывает меню со светлой и тёмной темой', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Выбрать тему оформления' }));

    expect(
      screen.getByRole('button', { name: 'Выбрать тему оформления' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Светлая' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Тёмная' })).toBeInTheDocument();
  });

  it('по умолчанию активна Светлая; выбор Тёмной сохраняется и закрывает меню', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole('button', { name: 'Выбрать тему оформления' });
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: 'Светлая' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Тёмная' }));

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveFocus();
  });

  it('повторное открытие показывает Тёмную нажатой; Светлая возвращает light', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole('button', { name: 'Выбрать тему оформления' });
    await user.click(toggleButton);
    await user.click(screen.getByRole('button', { name: 'Тёмная' }));

    await user.click(toggleButton);
    expect(screen.getByRole('button', { name: 'Тёмная' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Светлая' }));

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('Escape закрывает меню', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole('button', { name: 'Выбрать тему оформления' });
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveFocus();
  });

  it('клик вне компонента закрывает меню', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Снаружи</button>
        <ThemeToggle />
      </div>,
    );

    const toggleButton = screen.getByRole('button', { name: 'Выбрать тему оформления' });
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: 'Снаружи' }));

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
