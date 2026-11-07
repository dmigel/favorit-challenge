import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from './EmptyState.jsx';

describe('EmptyState', () => {
  it('показывает заголовок, описание и children', () => {
    render(
      <EmptyState title="Ничего не найдено" description="Попробуйте другой номер">
        <button type="button">Искать снова</button>
      </EmptyState>,
    );

    expect(screen.getByRole('heading', { name: 'Ничего не найдено' })).toBeInTheDocument();
    expect(screen.getByText('Попробуйте другой номер')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Искать снова' })).toBeInTheDocument();
  });

  it('без description не рендерит абзац', () => {
    const { container } = render(<EmptyState title="Пусто" />);

    expect(screen.getByRole('heading', { name: 'Пусто' })).toBeInTheDocument();
    expect(container.querySelector('p')).toBeNull();
  });
});
