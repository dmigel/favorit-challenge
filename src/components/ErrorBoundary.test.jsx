import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary.jsx';

/**
 * Тестовый компонент: бросает ошибку по флагу.
 * @param {{ shouldThrow: boolean }} props
 */
function Bomb({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('boom');
  }

  return <p>Всё хорошо</p>;
}

/**
 * Обёртка: управляет флагом ошибки снаружи границы.
 */
function Harness() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setShouldThrow(false)}>
        Устранить причину
      </button>
      <ErrorBoundary>
        <Bomb shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('без ошибки показывает children', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Всё хорошо')).toBeInTheDocument();
  });

  it('при ошибке показывает fallback и вызывает console.error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Произошла непредвиденная ошибка интерфейса.')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('после устранения причины и клика «Попробовать снова» children возвращаются', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Устранить причину' }));
    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }));

    expect(screen.getByText('Всё хорошо')).toBeInTheDocument();
  });
});
