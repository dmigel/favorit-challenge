import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';
import { renderWithProviders } from './test/renderWithProviders.jsx';

describe('App', () => {
  it('на "/" показывает заголовок главной внутри layout', () => {
    renderWithProviders(<App />, { route: '/' });

    expect(screen.getByRole('heading', { name: 'Поиск по номеру детали' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Подбор автозапчастей' })).toBeInTheDocument();
    expect(screen.getByText('Введите номер детали', { exact: false })).toBeInTheDocument();
  });

  it('на "/offers" показывает заголовок и «Не выбран производитель»', () => {
    renderWithProviders(<App />, { route: '/offers' });

    expect(screen.getByRole('heading', { name: 'Аналоги и предложения' })).toBeInTheDocument();
    expect(screen.getByText('Не выбран производитель')).toBeInTheDocument();
  });

  it('на "/unknown" показывает «Страница не найдена»', () => {
    renderWithProviders(<App />, { route: '/unknown' });

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument();
  });
});
