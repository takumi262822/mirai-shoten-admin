import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('"完了"ステータスが正しく表示される', () => {
    render(<StatusBadge status="完了" />);
    expect(screen.getByText('完了')).toBeInTheDocument();
  });
});
