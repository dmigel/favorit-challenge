import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { normalizeOffers } from '../api/normalizers.js';
import offersFixture from '../test/fixtures/offers-meyle-7160500039S.json';
import OffersResults from './OffersResults.jsx';

/**
 * Собирает синтетическую позицию для тестов результатов.
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

const { requested, analogues } = normalizeOffers(offersFixture.goods);

/**
 * Возвращает бренды строк tbody таблицы «Аналоги».
 * @returns {string[]}
 */
function getAnalogueBrands() {
  const table = screen.getByRole('table', { name: 'Аналоги' });
  const rows = within(table).getAllByRole('row').slice(1);
  return rows.map((row) => within(row).getAllByRole('cell')[0].querySelector('.fw-semibold')?.textContent);
}

describe('OffersResults', () => {
  it('по умолчанию «только в наличии»: LEX, RTS, Mapco, SUFIX', () => {
    render(<OffersResults requested={requested} analogues={analogues} />);

    expect(screen.getByLabelText('Только в наличии')).toBeChecked();
    expect(getAnalogueBrands()).toEqual(['LEX', 'RTS', 'Mapco', 'SUFIX']);
  });

  it('выключение переключателя показывает шесть строк', async () => {
    const user = userEvent.setup();
    render(<OffersResults requested={requested} analogues={analogues} />);

    await user.click(screen.getByLabelText('Только в наличии'));
    expect(getAnalogueBrands()).toHaveLength(6);
  });

  it('текст «rts» оставляет одну строку', async () => {
    const user = userEvent.setup();
    render(<OffersResults requested={requested} analogues={analogues} />);

    await user.type(screen.getByLabelText('Поиск среди аналогов'), 'rts');
    expect(getAnalogueBrands()).toEqual(['RTS']);
  });

  it('«zzzz» показывает пустые фильтры, сброс возвращает строки', async () => {
    const user = userEvent.setup();
    render(<OffersResults requested={requested} analogues={analogues} />);

    await user.type(screen.getByLabelText('Поиск среди аналогов'), 'zzzz');
    expect(screen.getByText('Ничего не подошло под фильтры')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(getAnalogueBrands()).toHaveLength(6);
  });

  it('сортировка «Сначала дороже» ставит SUFIX первым', async () => {
    const user = userEvent.setup();
    render(<OffersResults requested={requested} analogues={analogues} />);

    await user.selectOptions(screen.getByLabelText('Сортировка'), 'price-desc');
    expect(getAnalogueBrands()[0]).toBe('SUFIX');
  });

  it('постраничный вывод: 20 → 40 → 45', async () => {
    const user = userEvent.setup();
    const parts = Array.from({ length: 45 }, (_, index) =>
      makePart({
        id: `id-${index}`,
        brand: `B${String(index).padStart(2, '0')}`,
        totalStock: 1,
        minPrice: index + 1,
      }),
    );

    render(<OffersResults requested={null} analogues={parts} />);

    expect(getAnalogueBrands()).toHaveLength(20);
    expect(
      screen.getByRole('button', { name: 'Показать ещё (осталось 25)' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Показать ещё/ }));
    expect(getAnalogueBrands()).toHaveLength(40);

    await user.click(screen.getByRole('button', { name: /Показать ещё/ }));
    expect(getAnalogueBrands()).toHaveLength(45);
    expect(screen.queryByRole('button', { name: /Показать ещё/ })).not.toBeInTheDocument();
  });

  it('пустые аналоги: EmptyState без панели фильтров', () => {
    render(<OffersResults requested={requested} analogues={[]} />);

    expect(screen.getByText('Аналоги не найдены')).toBeInTheDocument();
    expect(screen.queryByLabelText('Поиск среди аналогов')).not.toBeInTheDocument();
  });

  it('карточка «Искомая деталь» видна только при requested !== null', () => {
    const { rerender } = render(
      <OffersResults requested={requested} analogues={analogues} />,
    );
    expect(screen.getByRole('heading', { name: 'Искомая деталь' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Искомая деталь' })).toBeInTheDocument();

    rerender(<OffersResults requested={null} analogues={analogues} />);
    expect(screen.queryByRole('heading', { name: 'Искомая деталь' })).not.toBeInTheDocument();
  });

  it('смена key сбрасывает фильтры', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OffersResults key="a" requested={requested} analogues={analogues} />,
    );

    await user.click(screen.getByLabelText('Только в наличии'));
    expect(screen.getByLabelText('Только в наличии')).not.toBeChecked();

    rerender(<OffersResults key="b" requested={requested} analogues={analogues} />);
    expect(screen.getByLabelText('Только в наличии')).toBeChecked();
  });
});
