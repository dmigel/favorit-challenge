import { applyMiddleware, compose, legacy_createStore as createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './rootReducer.js';

/**
 * Возвращает compose с поддержкой Redux DevTools, если доступны.
 * @returns {typeof compose}
 */
function getComposeEnhancers() {
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
  return compose;
}

/**
 * Создаёт Redux-хранилище приложения.
 * @param {object} [preloadedState]
 * @returns {import('redux').Store}
 */
export function createAppStore(preloadedState) {
  const composeEnhancers = getComposeEnhancers();
  return createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));
}

/** Готовое хранилище приложения. */
export const store = createAppStore();
