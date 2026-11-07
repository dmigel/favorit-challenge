import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { STATUS } from '../store/helpers.js';
import AsyncView from './AsyncView.jsx';

describe('AsyncView', () => {
  it('idle ничего не рендерит', () => {
    const { container } = render(
      <AsyncView status={STATUS.IDLE}>
        <p>Контент</p>
      </AsyncView>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('loading показывает status', () => {
    render(<AsyncView status={STATUS.LOADING} loadingLabel="Загрузка…" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
  });

  it('failed показывает alert с message и рабочий retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <AsyncView
        status={STATUS.FAILED}
        error={{ kind: 'network', message: 'Нет сети' }}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Нет сети')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('failed без error показывает запасной текст', () => {
    render(<AsyncView status={STATUS.FAILED} error={null} />);

    expect(screen.getByText('Неизвестная ошибка')).toBeInTheDocument();
  });

  it('succeeded + isEmpty показывает пустое состояние', () => {
    render(
      <AsyncView
        status={STATUS.SUCCEEDED}
        isEmpty
        emptyTitle="Ничего не найдено"
        emptyDescription="Измените запрос"
      >
        <p>Контент</p>
      </AsyncView>,
    );

    expect(screen.getByRole('heading', { name: 'Ничего не найдено' })).toBeInTheDocument();
    expect(screen.getByText('Измените запрос')).toBeInTheDocument();
    expect(screen.queryByText('Контент')).not.toBeInTheDocument();
  });

  it('succeeded рендерит children', () => {
    render(
      <AsyncView status={STATUS.SUCCEEDED}>
        <p>Контент</p>
      </AsyncView>,
    );

    expect(screen.getByText('Контент')).toBeInTheDocument();
  });
});
