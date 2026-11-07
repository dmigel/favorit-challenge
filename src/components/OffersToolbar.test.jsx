import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SORT } from '../utils/constants.js';
import OffersToolbar from './OffersToolbar.jsx';

describe('OffersToolbar', () => {
  it('поля доступны по label и отражают props', () => {
    render(
      <OffersToolbar
        text="rts"
        inStockOnly={true}
        sort={SORT.PRICE_ASC}
        onTextChange={() => {}}
        onInStockOnlyChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('Поиск среди аналогов')).toHaveValue('rts');
    expect(screen.getByLabelText('Сортировка')).toHaveValue(SORT.PRICE_ASC);
    expect(screen.getByLabelText('Только в наличии')).toBeChecked();
  });

  it('ввод, переключатель и select вызывают колбэки', async () => {
    const user = userEvent.setup();
    const onTextChange = vi.fn();
    const onInStockOnlyChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <OffersToolbar
        text=""
        inStockOnly={false}
        sort={SORT.PRICE_ASC}
        onTextChange={onTextChange}
        onInStockOnlyChange={onInStockOnlyChange}
        onSortChange={onSortChange}
      />,
    );

    await user.type(screen.getByLabelText('Поиск среди аналогов'), 'abc');
    expect(onTextChange).toHaveBeenCalled();
    expect(onTextChange.mock.calls.at(-1)[0]).toBe('c');

    await user.click(screen.getByLabelText('Только в наличии'));
    expect(onInStockOnlyChange).toHaveBeenCalledWith(true);

    await user.selectOptions(screen.getByLabelText('Сортировка'), SORT.PRICE_DESC);
    expect(onSortChange).toHaveBeenCalledWith('price-desc');
  });

  it('переключатель вызывает onInStockOnlyChange с false при выключении', async () => {
    const user = userEvent.setup();
    const onInStockOnlyChange = vi.fn();

    render(
      <OffersToolbar
        text=""
        inStockOnly={true}
        sort={SORT.PRICE_ASC}
        onTextChange={() => {}}
        onInStockOnlyChange={onInStockOnlyChange}
        onSortChange={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Только в наличии'));
    expect(onInStockOnlyChange).toHaveBeenCalledWith(false);
  });
});
