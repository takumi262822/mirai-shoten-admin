import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('"delivered"ステータスが正しく表示される', () => {
    render(<StatusBadge status="delivered" />);
    expect(screen.getByText('配達完了')).toBeInTheDocument();
  });
});
