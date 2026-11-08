import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('со строкой title даёт «title · Подбор автозапчастей»', () => {
    renderHook(() => useDocumentTitle('Поиск по номеру детали'));

    expect(document.title).toBe('Поиск по номеру детали · Подбор автозапчастей');
  });

  it('с пустой строкой даёт просто «Подбор автозапчастей»', () => {
    renderHook(() => useDocumentTitle(''));

    expect(document.title).toBe('Подбор автозапчастей');
  });

  it('смена title через rerender обновляет document.title', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'Поиск по номеру детали' } },
    );

    expect(document.title).toBe('Поиск по номеру детали · Подбор автозапчастей');

    rerender({ title: 'Аналоги и предложения' });

    expect(document.title).toBe('Аналоги и предложения · Подбор автозапчастей');
  });
});
