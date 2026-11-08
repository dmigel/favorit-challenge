import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

describe('ThemeToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    localStorage.clear();
  });

  it('переключает тему по клику и меняет доступное имя', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Включить тёмную тему' });

    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'Включить светлую тему' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Включить светлую тему' }));

    expect(
      screen.getByRole('button', { name: 'Включить тёмную тему' }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });
});
