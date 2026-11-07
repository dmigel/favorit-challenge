import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TEST_NUMBERS } from '../test/handlers.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { server } from '../test/server.js';
import HomePage from './HomePage.jsx';

/**
 * Оборачивает HomePage маршрутами для проверки навигации.
 */
function HomeWithRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/offers" element={<p>страница предложений</p>} />
    </Routes>
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
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });
  });

  it('ввод номера и клик «Найти» показывает бренды', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    await waitFor(() => {
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });
  });

  it('Enter в поле запускает поиск', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />);

    await user.type(screen.getByLabelText('Номер детали'), '0189{Enter}');

    await waitFor(() => {
      expect(screen.getAllByRole('link')).toHaveLength(4);
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
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });
  });

  it('клик по бренду открывает страницу предложений', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeWithRoutes />, { route: '/?number=0189' });

    await waitFor(() => {
      expect(screen.getAllByRole('link')).toHaveLength(4);
    });

    await user.click(screen.getByRole('link', { name: /CAFFARO/ }));

    expect(screen.getByText('страница предложений')).toBeInTheDocument();
  });
});
