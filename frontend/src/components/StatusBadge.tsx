import { OrderStatus, STATUS_COLORS, STATUS_LABELS } from '../types';

interface Props {
  status: OrderStatus;
}

/** ステータスを色分けのバッジで表示するコンポーネント */
export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
