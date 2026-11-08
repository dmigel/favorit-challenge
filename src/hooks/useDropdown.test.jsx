import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useDropdown } from './useDropdown.js';

/**
 * Минимальный компонент для проверки поведения useDropdown.
 */
function DropdownProbe() {
  const { isOpen, toggle, close, containerRef, toggleRef } = useDropdown();

  return (
    <div>
      <button type="button" onClick={() => {}}>
        Снаружи
      </button>
      <div ref={containerRef}>
        <button type="button" ref={toggleRef} onClick={toggle}>
          Меню
        </button>
        {isOpen ? (
          <div>
            <button type="button" onClick={close}>
              Пункт
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

describe('useDropdown', () => {
  it('toggle открывает и закрывает меню', async () => {
    const user = userEvent.setup();
    render(<DropdownProbe />);

    expect(screen.queryByRole('button', { name: 'Пункт' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Меню' }));
    expect(screen.getByRole('button', { name: 'Пункт' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Меню' }));
    expect(screen.queryByRole('button', { name: 'Пункт' })).not.toBeInTheDocument();
  });

  it('mousedown вне меню закрывает без возврата фокуса', async () => {
    const user = userEvent.setup();
    render(<DropdownProbe />);

    const toggleButton = screen.getByRole('button', { name: 'Меню' });
    await user.click(toggleButton);
    expect(screen.getByRole('button', { name: 'Пункт' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Снаружи' }));

    expect(screen.queryByRole('button', { name: 'Пункт' })).not.toBeInTheDocument();
    expect(toggleButton).not.toHaveFocus();
  });

  it('Escape закрывает меню и возвращает фокус на кнопку', async () => {
    const user = userEvent.setup();
    render(<DropdownProbe />);

    const toggleButton = screen.getByRole('button', { name: 'Меню' });
    await user.click(toggleButton);
    expect(screen.getByRole('button', { name: 'Пункт' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('button', { name: 'Пункт' })).not.toBeInTheDocument();
    expect(toggleButton).toHaveFocus();
  });

  it('mousedown внутри меню не закрывает', async () => {
    const user = userEvent.setup();

    /**
     * Вариант без close на пункте — только проверка outside-click.
     */
    function OpenMenuProbe() {
      const { isOpen, toggle, containerRef, toggleRef } = useDropdown();

      return (
        <div>
          <button type="button">Снаружи</button>
          <div ref={containerRef}>
            <button type="button" ref={toggleRef} onClick={toggle}>
              Меню
            </button>
            {isOpen ? <div data-testid="panel">Панель</div> : null}
          </div>
        </div>
      );
    }

    render(<OpenMenuProbe />);

    await user.click(screen.getByRole('button', { name: 'Меню' }));
    expect(screen.getByTestId('panel')).toBeInTheDocument();

    await user.click(screen.getByTestId('panel'));
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('после закрытия слушатели сняты: Escape ничего не ломает', async () => {
    const user = userEvent.setup();
    render(<DropdownProbe />);

    const toggleButton = screen.getByRole('button', { name: 'Меню' });
    await user.click(toggleButton);
    await user.keyboard('{Escape}');
    expect(toggleButton).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Пункт' })).not.toBeInTheDocument();
    expect(toggleButton).toHaveFocus();
  });
});
