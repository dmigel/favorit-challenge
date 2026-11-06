import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createAppStore } from '../store/index.js';

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
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );

  return { store, ...result };
}
