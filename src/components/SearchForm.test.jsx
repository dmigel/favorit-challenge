import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchForm from './SearchForm.jsx';

describe('SearchForm', () => {
  it('рендерит label и поле с initialValue', () => {
    const { container } = render(<SearchForm initialValue="0189" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0189');
    const group = container.querySelector('.input-group');
    expect(group).toHaveClass('search-group');
    expect(group).toHaveClass('input-group-lg');
  });


  it('кнопка disabled при пустом и пробельном значении', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSubmit={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Найти' });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Номер детали'), '   ');
    expect(button).toBeDisabled();
  });

  it('клик «Найти» вызывает onSubmit с обрезанным значением', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Номер детали'), '  0189  ');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('0189');
  });

  it('Enter тоже отправляет форму', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchForm onSubmit={onSubmit} />);

    const input = screen.getByLabelText('Номер детали');
    await user.type(input, '0189{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('0189');
  });

  it('пробельное значение не вызывает onSubmit', () => {
    const onSubmit = vi.fn();
    const { container } = render(<SearchForm initialValue="   " onSubmit={onSubmit} />);

    container.querySelector('form').requestSubmit();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('при смене initialValue поле обновляется', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <SearchForm initialValue="0189" onSubmit={onSubmit} />,
    );

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0189');

    rerender(<SearchForm initialValue="0420" onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0420');
  });

  it('onChange вызывается на каждый ввод с текущим значением', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchForm onSubmit={vi.fn()} onChange={onChange} />);

    await user.type(screen.getByLabelText('Номер детали'), 'ab');

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'ab');
  });

  it('hint виден и связан с полем', () => {
    render(
      <SearchForm
        onSubmit={vi.fn()}
        hint="Подсказка автопоиска"
      />,
    );

    const input = screen.getByLabelText('Номер детали');
    expect(screen.getByText('Подсказка автопоиска')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription('Подсказка автопоиска');
  });

  it('без hint описания нет', () => {
    render(<SearchForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Номер детали')).not.toHaveAccessibleDescription();
  });

  it('если trim ввода равен новому initialValue, завершающий пробел сохраняется', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <SearchForm initialValue="" onSubmit={onSubmit} />,
    );

    await user.type(screen.getByLabelText('Номер детали'), '0189 ');

    rerender(<SearchForm initialValue="0189" onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Номер детали')).toHaveValue('0189 ');
  });
});
