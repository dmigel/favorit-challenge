import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loader from './Loader.jsx';

describe('Loader', () => {
  it('показывает status и текст по умолчанию', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });

  it('показывает кастомный label', () => {
    render(<Loader label="Ищем детали…" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Ищем детали…')).toBeInTheDocument();
  });
});
