import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { OffersTable } from './OffersTable.jsx';

const { analogues } = normalizeOffers(offersFixture.goods);

describe('OffersTable', () => {
  it('показывает заголовки, caption и строки аналогов', () => {
    const { container } = render(<OffersTable items={analogues} caption="Аналоги" />);

    const table = screen.getByRole('table', { name: 'Аналоги' });
    expect(within(table).getByRole('columnheader', { name: 'Позиция' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Цена' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Остаток' })).toBeInTheDocument();
    expect(container.querySelector('.table-responsive')).toBeNull();

    expect(within(table).getByText('VEMO/VAICO')).toBeInTheDocument();
    expect(within(table).getAllByText('Нет в наличии').length).toBeGreaterThanOrEqual(1);
    expect(within(table).getByText('RTS')).toBeInTheDocument();
  });

  it('у VEMO/VAICO нет кнопки складов, у RTS есть и раскрывается', async () => {
    const user = userEvent.setup();
    render(<OffersTable items={analogues} caption="Аналоги" />);

    const vemoRow = screen.getByText('VEMO/VAICO').closest('tr');
    expect(within(vemoRow).queryByRole('button', { name: /Склады/ })).not.toBeInTheDocument();
    expect(within(vemoRow).getByText('—')).toBeInTheDocument();
    expect(within(vemoRow).getByText('Нет в наличии')).toBeInTheDocument();

    const rts = analogues.find((part) => part.brand === 'RTS');
    const button = screen.getByRole('button', {
      name: `Склады (${rts.offers.length})`,
    });

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list', { name: 'Склады' })).toBeInTheDocument();
    expect(document.getElementById(`warehouses-${rts.id}`)).toHaveClass(
      'parts-table__details',
    );

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

