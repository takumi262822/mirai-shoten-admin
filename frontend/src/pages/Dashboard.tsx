import { Link } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { useOrders } from '../hooks/useOrders';
import { StatusBadge } from '../components/StatusBadge';
import { STATUS_LABELS } from '../types';

/** ダッシュボード画面 */
export default function Dashboard() {
  const { stats, loading: statsLoading } = useStats();
  const { orders, loading: ordersLoading } = useOrders({ limit: 5 });

  return (
    <div className="page">
      <h1 className="page__title">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">総注文件数</p>
          <p className="stat-card__value">{statsLoading ? '—' : stats?.totalOrders ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">売上合計</p>
          <p className="stat-card__value">
            ¥{statsLoading ? '—' : (stats?.totalRevenue ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card stat-card--accent">
          <p className="stat-card__label">受付中</p>
          <p className="stat-card__value">{statsLoading ? '—' : stats?.byStatus.pending ?? 0}</p>
        </div>
        <div className="stat-card stat-card--success">
          <p className="stat-card__label">配達完了</p>
          <p className="stat-card__value">{statsLoading ? '—' : stats?.byStatus.delivered ?? 0}</p>
        </div>
      </div>

      {/* ステータス別件数 */}
      {stats && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 className="card__title">ステータス別件数</h2>
          <div className="status-summary">
            {(Object.entries(stats.byStatus) as [keyof typeof STATUS_LABELS, number][]).map(
              ([key, count]) => (
                <div key={key} className="status-summary__item">
                  <StatusBadge status={key} />
                  <span className="status-summary__count">{count} 件</span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* 直近の注文 */}
      <div className="card">
        <div className="card__header">
          <h2 className="card__title">直近の注文</h2>
          <Link to="/orders" className="btn btn--secondary btn--sm">すべて見る</Link>
        </div>
        {ordersLoading ? (
          <p className="loading-text">読み込み中...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>顧客名</th>
                <th>メール</th>
                <th>合計金額</th>
                <th>ステータス</th>
                <th>日時</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} className="table-link">
                      {order.customer_name}
                    </Link>
                  </td>
                  <td>{order.email}</td>
                  <td>¥{order.total_price != null ? order.total_price.toLocaleString() : '-'}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{new Date(order.created_at).toLocaleString('ja-JP')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>注文データがありません</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
