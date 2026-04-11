import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { OrderStatus } from '../types/index';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '受付中' },
  { value: 'processing', label: '処理中' },
  { value: 'shipped', label: '発送済み' },
  { value: 'delivered', label: '配達完了' },
  { value: 'cancelled', label: 'キャンセル' },
];

/** 注文一覧画面 */
export default function Orders() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { orders, total, loading, error } = useOrders({
    status: status || undefined,
    page,
    limit: LIMIT,
  });

  function handleStatusChange(value: string) {
    setStatus(value as OrderStatus | '');
    setPage(1);
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">注文管理</h1>
        <Link to="/orders/new" className="btn btn--primary">+ 新規注文</Link>
      </div>

      {/* フィルター */}
      <div className="filter-bar">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-btn ${status === opt.value ? 'filter-btn--active' : ''}`}
            onClick={() => handleStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="loading-text">読み込み中...</p>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>顧客名</th>
                  <th>メール</th>
                  <th>合計金額</th>
                  <th>ステータス</th>
                  <th>注文日時</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>{order.customer_name}</td>
                    <td>{order.email}</td>
                    <td>¥{order.total_price != null ? order.total_price.toLocaleString() : '-'}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td>{new Date(order.created_at).toLocaleString('ja-JP')}</td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn--secondary btn--sm">
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      注文データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination total={total} page={page} limit={LIMIT} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
