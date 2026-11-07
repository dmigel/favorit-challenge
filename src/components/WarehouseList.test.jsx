import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import WarehouseList from './WarehouseList.jsx';

const { requested } = normalizeOffers(offersFixture.goods);
const meyleOffers = requested.offers;

describe('WarehouseList', () => {
  it('рендерит семь складов MEYLE с ценой, отгрузкой и бейджами', () => {
    render(<WarehouseList offers={meyleOffers} />);

    const list = screen.getByRole('list', { name: 'Склады' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(7);

    expect(items[0].textContent.replace(/\s/g, ' ')).toContain('23 346,86 ₽');
    expect(screen.getAllByText('Невозвратный')).toHaveLength(1);
    expect(screen.queryByText('Свой склад')).not.toBeInTheDocument();

    expect(list.textContent).toContain('Отгрузка');
    expect(list.textContent).toContain('МСК');
  });

  it('показывает бейдж «Свой склад» для own=true', () => {
    render(
      <WarehouseList
        offers={[
          {
            id: 'own-1',
            code: 'СПБ',
            own: true,
            price: 100,
            stock: 2,
            shipmentDate: '2026-11-09T18:00:00+03:00',
            notRefund: false,
          },
        ]}
      />,
    );

    expect(screen.getByText('Свой склад')).toBeInTheDocument();
  });
});
