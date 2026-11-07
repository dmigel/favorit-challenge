import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import { PartRow } from './PartRow.jsx';

/**
 * Собирает синтетическую позицию для тестов строки.
 * @param {Partial<import('../api/normalizers.js').Part>} [overrides]
 * @returns {import('../api/normalizers.js').Part}
 */
function makePart(overrides = {}) {
  return {
    id: 'id',
    brand: 'Brand',
    number: '1',
    name: 'Part',
    totalStock: 0,
    minPrice: null,
    notRefund: false,
    offers: [],
    ...overrides,
  };
}

const { analogues } = normalizeOffers(offersFixture.goods);
const vemo = analogues.find((part) => part.brand === 'VEMO/VAICO');
const rts = analogues.find((part) => part.brand === 'RTS');

/**
 * Рендерит PartRow внутри таблицы.
 * @param {import('../api/normalizers.js').Part} part
 */
function renderPartRow(part) {
  return render(
    <table>
      <tbody>
        <PartRow part={part} />
      </tbody>
    </table>,
  );
}

describe('PartRow', () => {
  it('у VEMO/VAICO нет складов, цена «—» и бейдж «Нет в наличии»', () => {
    renderPartRow(vemo);

    expect(screen.getByText('Нет в наличии')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Склады/ })).not.toBeInTheDocument();
  });

  it('у RTS кнопка «Склады» раскрывает и скрывает список', async () => {
    const user = userEvent.setup();
    renderPartRow(rts);

    const button = screen.getByRole('button', {
      name: `Склады (${rts.offers.length})`,
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list', { name: 'Склады' })).toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list', { name: 'Склады' })).not.toBeInTheDocument();
  });

  it('бейдж «Невозвратная позиция» только при notRefund', () => {
    const { rerender } = render(
      <table>
        <tbody>
          <PartRow part={makePart({ notRefund: true, brand: 'A' })} />
        </tbody>
      </table>,
    );

    expect(screen.getByText('Невозвратная позиция')).toBeInTheDocument();

    rerender(
      <table>
        <tbody>
          <PartRow part={makePart({ notRefund: false, brand: 'A' })} />
        </tbody>
      </table>,
    );

    expect(screen.queryByText('Невозвратная позиция')).not.toBeInTheDocument();
  });

  it('форматирует цену «от …» через Intl', () => {
    renderPartRow(rts);

    const row = screen.getByText('RTS').closest('tr');
    expect(row.textContent.replace(/\s/g, ' ')).toMatch(/от 1 482,00 ₽/);
  });
});
