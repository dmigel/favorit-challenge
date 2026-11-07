import { render, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createAppStore } from '../store/index.js';

/**
 * Создаёт обёртку Provider + MemoryRouter для тестов.
 * @param {{ store: import('redux').Store, route: string }} options
 * @returns {import('react').ComponentType<{ children: import('react').ReactNode }>}
 */
function createWrapper({ store, route }) {
  return function Providers({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  };
}

/**
 * Рендерит UI в Provider и MemoryRouter для тестов.
 * @param {import('react').ReactElement} ui
 * @param {{ preloadedState?: object, store?: import('redux').Store, route?: string }} [options]
 * @returns {{ store: import('redux').Store } & import('@testing-library/react').RenderResult}
 */
export function renderWithProviders(
  ui,
  { preloadedState, store = createAppStore(preloadedState), route = '/' } = {},
) {
  const Wrapper = createWrapper({ store, route });
  const result = render(ui, { wrapper: Wrapper });

  return { store, ...result };
}

/**
 * Рендерит хук в Provider и MemoryRouter для тестов.
 * @param {(props?: object) => unknown} hook
 * @param {{ preloadedState?: object, store?: import('redux').Store, route?: string } & object} [options]
 * @returns {{ store: import('redux').Store } & import('@testing-library/react').RenderHookResult<unknown, unknown>}
 */
export function renderHookWithProviders(
  hook,
  {
    preloadedState,
    store = createAppStore(preloadedState),
    route = '/',
    ...renderHookOptions
  } = {},
) {
  const Wrapper = createWrapper({ store, route });
  const result = renderHook(hook, { wrapper: Wrapper, ...renderHookOptions });

  return { store, ...result };
}
