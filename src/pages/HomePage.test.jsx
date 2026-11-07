import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TEST_NUMBERS } from '../test/handlers.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import HomePage from './HomePage.jsx';

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
  it('пустой URL показывает форму и подсказку без запросов', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<HomeWithRoutes />);

    expect(screen.getByLabelText('Номер детали')).toBeInTheDocument();
    expect(
      screen.getByText('Введите номер детали, чтобы увидеть производителей'),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('route /?number=0189 показывает поле, лоадер и затем бренды', async () => {
    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0189');
    expect(screen.getByRole('status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
    });
  });

  it('ввод номера и клик «Найти» показывает бренды', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
    });
  });

  it('Enter в поле запускает поиск', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189{Enter}');

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

  it('QUOTA показывает alert с текстом лимита', async () => {
    renderWithProviders(<HomeWithRoutes />, {
      route: `/?number=${TEST_NUMBERS.QUOTA}`,
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Превышен лимит запросов, попробуйте позже',
      );
    });
  });

  it('NETWORK показывает alert о соединении', async () => {
    renderWithProviders(<HomeWithRoutes />, {
      route: `/?number=${TEST_NUMBERS.NETWORK}`,
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Нет соединения с сервером');
    });
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

  it('клик по бренду открывает страницу предложений', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
    });

    await user.click(screen.getByRole('link', { name: /CAFFARO/ }));

    expect(screen.getByText('страница предложений')).toBeInTheDocument();
  });

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

  it('ввод и немедленный клик «Найти»: один запрос, отложенный вызов отменён', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    await waitFor(
      () => {
        expect(screen.getAllByRole('link', { name: BRAND_LINK_NAME })).toHaveLength(4);
      },
      { timeout: 2000 },
    );

    expect(getNumberFetchCalls(fetchSpy)).toHaveLength(1);

    fetchSpy.mockRestore();
  });

  it('ввод, затем переход по ссылке: в поле номер из ссылки, лишних запросов нет', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189');
    await user.click(screen.getByRole('link', { name: 'перейти на 0420' }));

    await waitFor(
      () => {
        expect(screen.getByLabelText('Номер детали')).toHaveValue('0420');
      },
      { timeout: 2000 },
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0420');

    const numberCalls = getNumberFetchCalls(fetchSpy);
    expect(numberCalls).toHaveLength(1);
    expect(String(numberCalls[0][0])).toContain('number=0420');

    fetchSpy.mockRestore();
  });
});
