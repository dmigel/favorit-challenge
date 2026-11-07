import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { normalizeBrands } from '../api/normalizers.js';
import brandsFixture from '../test/fixtures/brands-0189.json';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import ConnectedBrandList, { BrandList } from './BrandList.jsx';

const items = normalizeBrands(brandsFixture.goods);

describe('BrandList', () => {
  it('рендерит четыре ссылки в ожидаемом порядке', () => {
    render(
      <MemoryRouter>
        <BrandList items={items} number="0189" />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links.map((link) => link.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('CAFFARO'),
        expect.stringContaining('HAFFEN'),
        expect.stringContaining('ZEN'),
        expect.stringContaining('NGK/NTK'),
      ]),
    );
    expect(links[0]).toHaveTextContent('CAFFARO');
    expect(links[1]).toHaveTextContent('HAFFEN');
    expect(links[2]).toHaveTextContent('ZEN');
    expect(links[3]).toHaveTextContent('NGK/NTK');
  });

  it('кодирует бренд NGK/NTK в href', () => {
    render(
      <MemoryRouter>
        <BrandList items={items} number="0189" />
      </MemoryRouter>,
    );

    const ngkLink = screen.getByRole('link', { name: /NGK\/NTK/ });
    expect(ngkLink).toHaveAttribute('href', '/offers?number=0189&brand=NGK%2FNTK');
  });

  it('показывает бейджи наличия и цены', () => {
    render(
      <MemoryRouter>
        <BrandList items={items} number="0189" />
      </MemoryRouter>,
    );

    expect(screen.getByText('В наличии: 16')).toBeInTheDocument();
    expect(screen.getByText('Нет в наличии')).toBeInTheDocument();

    const caffaro = screen.getByRole('link', { name: /CAFFARO/ });
    expect(caffaro.textContent.replace(/\s/g, ' ')).toMatch(/от 548,40/);

    const ngk = screen.getByRole('link', { name: /NGK\/NTK/ });
    expect(ngk.textContent.replace(/\s/g, ' ')).not.toMatch(/от /);
    expect(within(ngk).queryByText('Нет в наличии')).toBeInTheDocument();
  });

  it('подключённый компонент читает items из store', () => {
    renderWithProviders(<ConnectedBrandList number="0189" />, {
      preloadedState: {
        brands: {
          status: 'succeeded',
          query: { number: '0189' },
          items,
          error: null,
        },
      },
    });

    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.getByText('Найдено производителей: 4. Выберите нужного:')).toBeInTheDocument();
  });
});
