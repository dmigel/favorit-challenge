import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('рендерится и содержит заголовок', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Подбор автозапчастей' })).toBeInTheDocument();
  });
});
