import { screen } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { selectBrandsStatus } from '../features/brands/selectors.js';
import { STATUS } from '../store/helpers.js';
import { renderHookWithProviders, renderWithProviders } from './renderWithProviders.jsx';

/**
 * Тестовый компонент: читает статус brands и текущий маршрут.
 */
function Probe() {
  const status = useSelector(selectBrandsStatus);
  const location = useLocation();

  return (
    <div>
      <span>status:{status}</span>
      <span>path:{location.pathname}</span>
    </div>
  );
}

describe('renderWithProviders', () => {
  it('даёт store и роутер с нужным route', () => {
    const { store } = renderWithProviders(<Probe />, { route: '/search/0189' });

    expect(store.getState().brands.status).toBe(STATUS.IDLE);
    expect(screen.getByText('status:idle')).toBeInTheDocument();
    expect(screen.getByText('path:/search/0189')).toBeInTheDocument();
  });
});

describe('renderHookWithProviders', () => {
  it('даёт store и результат хука', () => {
    const { store, result } = renderHookWithProviders(() =>
      useSelector(selectBrandsStatus),
    );

    expect(store.getState().brands.status).toBe(STATUS.IDLE);
    expect(result.current).toBe(STATUS.IDLE);
  });
});

