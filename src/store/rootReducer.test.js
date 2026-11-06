import { describe, expect, it } from 'vitest';
import rootReducer from './rootReducer.js';

describe('rootReducer', () => {
  it('в начальном состоянии есть ключи brands и offers', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });

    expect(state).toHaveProperty('brands');
    expect(state).toHaveProperty('offers');
  });
});
