import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TEST_NUMBERS } from '../handlers.js';
import { renderWithProviders } from '../renderWithProviders.jsx';
import { server } from '../server.js';
import HomePage from '../../pages/HomePage.jsx';

/** Имена ссылок-брендов из фикстуры 0189 (без служебной навигации). */
const BRAND_LINK_NAME = /CAFFARO|HAFFEN|ZEN|NGK/;

/**
 * Оборачивает HomePage маршрутами для проверки навигации.
 */
function HomeWithRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <HomePage />
            <Link to="/?number=0420">перейти на 0420</Link>
          </>
        }
      />
      <Route path="/offers" element={<p>страница предложений</p>} />
    </Routes>
  );
}

/**
 * Возвращает вызовы fetch с параметром number в URL.
 * @param {import('vitest').Mock} fetchSpy
 * @returns {unknown[][]}
 */
function getNumberFetchCalls(fetchSpy) {
  return fetchSpy.mock.calls.filter(([input]) =>
    String(input).includes('number='),
  );
}

describe('HomePage', () => {
  it('ввод 0189 без клика: после паузы один запрос и четыре бренда', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189');

    expect(fetchSpy).not.toHaveBeenCalled();

    const brandLinks = await screen.findAllByRole(
      'link',
      { name: BRAND_LINK_NAME },
      { timeout: 2000 },
    );
    expect(brandLinks).toHaveLength(4);

    const numberCalls = getNumberFetchCalls(fetchSpy);
    expect(numberCalls).toHaveLength(1);
    expect(String(numberCalls[0][0])).toContain('number=0189');
    expect(String(numberCalls[0][0])).not.toMatch(/number=0(?!189)/);
    expect(String(numberCalls[0][0])).not.toContain('number=01&');
    expect(String(numberCalls[0][0])).not.toContain('number=018&');

    fetchSpy.mockRestore();
  });

  it('ввод из двух символов: через ~800 мс запросов нет', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '01');

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('очистка поля при открытом /?number=0189 сбрасывает результаты после паузы', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
      },
      { timeout: 2000 },
    );

    await user.clear(screen.getByLabelText('Номер детали'));

    expect(
      await screen.findByText(
        'Введите номер детали, чтобы увидеть производителей',
        {},
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
  });

  it('«Повторить» после одноразовой ошибки показывает бренды', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        '*/api/hsprice',
        () => HttpResponse.json({ error: 'Request quota exceeded!' }),
        { once: true },
      ),
    );

    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
    });
  });

  it('NOT_FOUND показывает пустое состояние', async () => {
    renderWithProviders(<HomeWithRoutes />, {
      route: `/?number=${TEST_NUMBERS.NOT_FOUND}`,
    });

    await waitFor(() => {
      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });
  });

  it('клик по бренду открывает страницу предложений', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
    });

    await user.click(screen.getByRole('link', { name: /CAFFARO/ }));

    expect(screen.getByText('страница предложений')).toBeInTheDocument();
  });
});
