import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App.jsx';
import { renderWithProviders } from '../renderWithProviders.jsx';
import { server } from '../server.js';

/** Имена ссылок-брендов из фикстуры 0189. */
const BRAND_LINK_NAME = /CAFFARO|HAFFEN|ZEN|NGK/;

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

describe('appFlow', () => {
  it('поиск -> бренд -> предложения -> назад без нового запроса', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<App />, { route: '/' });

    expect(
      screen.getByRole('heading', { name: 'Поиск по номеру детали' }),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Номер детали'), '0189');

    const brandNav = await screen.findByRole(
      'navigation',
      { name: 'Производители' },
      { timeout: 2000 },
    );
    expect(
      within(brandNav).getAllByRole('link', { name: BRAND_LINK_NAME }),
    ).toHaveLength(4);

    await user.click(within(brandNav).getByRole('link', { name: /ZEN/ }));

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Аналоги и предложения' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Искомая деталь' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();

    expect(
      within(screen.getByRole('table', { name: 'Аналоги' })).getAllByRole('row'),
    ).toHaveLength(5);

    await user.click(screen.getByLabelText('Только в наличии'));

    expect(
      within(screen.getByRole('table', { name: 'Аналоги' })).getAllByRole('row'),
    ).toHaveLength(7);

    await user.click(
      screen.getByRole('link', { name: '← К списку производителей' }),
    );

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Поиск по номеру детали' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();

    const brandsAgain = await screen.findByRole(
      'navigation',
      { name: 'Производители' },
      { timeout: 2000 },
    );
    expect(
      within(brandsAgain).getAllByRole('link', { name: BRAND_LINK_NAME }),
    ).toHaveLength(4);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('ошибка сети на этапе 2 и повтор', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('*/api/hsprice', () => HttpResponse.error(), { once: true }),
    );

    renderWithProviders(<App />, {
      route: '/offers?number=7160500039S&brand=MEYLE',
    });

    expect(
      await screen.findByRole('alert', {}, { timeout: 2000 }),
    ).toHaveTextContent('Нет соединения с сервером');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Искомая деталь' },
        { timeout: 2000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Аналоги' })).toBeInTheDocument();
  });
});
