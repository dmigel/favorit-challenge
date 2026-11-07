import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorAlert from './ErrorAlert.jsx';

describe('ErrorAlert', () => {
  it('показывает alert и текст ошибки', () => {
    render(<ErrorAlert message="Сеть недоступна" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Сеть недоступна')).toBeInTheDocument();
  });

  it('без onRetry не показывает кнопку', () => {
    render(<ErrorAlert message="Ошибка" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('с onRetry вызывает обработчик один раз', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorAlert message="Ошибка" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
