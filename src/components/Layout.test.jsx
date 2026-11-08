import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import Layout from './Layout.jsx';

/**
 * Дочерний маршрут, который бросает ошибку.
 */
function BrokenChild() {
  throw new Error('child boom');
}

/**
 * Дочерний маршрут без ошибок.
 */
function SafeChild() {
  return <p>Контент маршрута</p>;
}

describe('Layout', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('ссылка-бренд ведёт на "/"', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SafeChild />} />
        </Route>
      </Routes>,
    );

    expect(screen.getByRole('link', { name: /на главную/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getByRole('button', { name: 'Выбрать тему оформления' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('вложенный маршрут рендерится в Outlet', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SafeChild />} />
        </Route>
      </Routes>,
    );

    expect(screen.getByText('Контент маршрута')).toBeInTheDocument();
  });

  it('при ошибке в дочернем маршруте виден fallback, а шапка на месте', () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BrokenChild />} />
        </Route>
      </Routes>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /на главную/i })).toBeInTheDocument();
  });

  it('переход по ссылке бренда на "/" сбрасывает ошибку', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SafeChild />} />
          <Route path="broken" element={<BrokenChild />} />
        </Route>
      </Routes>,
      { route: '/broken' },
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /на главную/i }));

    expect(screen.getByText('Контент маршрута')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
