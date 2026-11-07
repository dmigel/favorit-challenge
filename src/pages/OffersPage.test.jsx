import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { TEST_NUMBERS } from '../test/handlers.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import OffersPage from './OffersPage.jsx';

/**
 * Оборачивает OffersPage маршрутами для проверки навигации.
 */
function OffersWithRoutes() {
  return (
    <Routes>
      <Route path="/" element={<p>страница поиска</p>} />
      <Route path="/offers" element={<OffersPage />} />
    </Routes>
  );
}

/**
 * Возвращает бренды строк tbody таблицы «Аналоги».
 * @returns {string[]}
 */
function getAnalogueBrands() {
  const table = screen.getByRole('table', { name: 'Аналоги' });
  const rows = within(table).getAllByRole('row').slice(1);
  return rows.map(
    (row) => within(row).getAllByRole('cell')[0].querySelector('.fw-semibold')?.textContent,
  );
}

describe('OffersPage', () => {
  it('загружает фикстуру MEYLE и показывает искомую деталь и 4 аналога', async () => {
    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=7160500039S&brand=MEYLE',
    });

    expect(
      screen.getByText('Загружаем аналоги и предложения…'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Искомая деталь' })).toBeInTheDocument();
    });

    expect(getAnalogueBrands()).toEqual(['LEX', 'RTS', 'Mapco', 'SUFIX']);

    const backLink = screen.getByRole('link', { name: '← К списку производителей' });
    expect(backLink).toHaveAttribute('href', '/?number=7160500039S');
  });

  it('без параметров показывает «Не выбран производитель» без запросов', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<OffersWithRoutes />, { route: '/offers' });

    expect(screen.getByText('Не выбран производитель')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('без бренда показывает «Не выбран производитель» без запросов', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=0189',
    });

    expect(screen.getByText('Не выбран производитель')).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('NOT_FOUND показывает пустое состояние', async () => {
    renderWithProviders(<OffersWithRoutes />, {
      route: `/offers?number=${TEST_NUMBERS.NOT_FOUND}&brand=MEYLE`,
    });

    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });
  });

  it('QUOTA показывает alert, «Повторить» после once:true загружает данные', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        '*/api/hsprice',
        () => HttpResponse.json({ error: 'Request quota exceeded!' }),
        { once: true },
      ),
    );

    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=7160500039S&brand=MEYLE',
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Превышен лимит запросов, попробуйте позже',
      );
    });

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Искомая деталь' })).toBeInTheDocument();
    });
  });

  it('NETWORK показывает alert о соединении', async () => {
    renderWithProviders(<OffersWithRoutes />, {
      route: `/offers?number=${TEST_NUMBERS.NETWORK}&brand=MEYLE`,
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Нет соединения с сервером');
    });
  });

  it('бренд NGK/NTK доходит до сервера без искажений', async () => {
    let receivedBrand = null;
    server.use(
      http.get('*/api/hsprice', ({ request }) => {
        receivedBrand = new URL(request.url).searchParams.get('brand');
        return HttpResponse.json(offersFixture);
      }),
    );

    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=0189&brand=NGK%2FNTK',
    });

    await waitFor(() => {
      expect(receivedBrand).toBe('NGK/NTK');
    });
  });

  it('«только в наличии» включено сразу после загрузки', async () => {
    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=7160500039S&brand=MEYLE',
    });

    await waitFor(() => {
      expect(getAnalogueBrands()).toHaveLength(4);
    });

    expect(screen.getByLabelText('Только в наличии')).toBeChecked();
  });

  it('клик «К списку производителей» открывает страницу поиска', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OffersWithRoutes />, {
      route: '/offers?number=7160500039S&brand=MEYLE',
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Искомая деталь' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: '← К списку производителей' }));
    expect(screen.getByText('страница поиска')).toBeInTheDocument();
  });
});
