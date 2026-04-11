import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { StatusBadge } from '../components/StatusBadge';
import { apiFetch } from '../utils/api';
import { OrderStatus, STATUS_LABELS } from '../types';

const STATUSES = Object.entries(STATUS_LABELS) as [OrderStatus, string][];

/** 注文詳細・編集画面 */
export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(id);

  const [editStatus, setEditStatus] = useState<OrderStatus | ''>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleStatusUpdate() {
    if (!id || !editStatus) return;
    setSaving(true);
    setSaveError('');
    try {
      await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: editStatus }),
      });
      navigate('/orders');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('この注文を削除しますか？')) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
      navigate('/orders');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '削除に失敗しました');
      setDeleting(false);
    }
  }

  if (loading) return <div className="page"><p className="loading-text">読み込み中...</p></div>;
  if (error || !order) return <div className="page"><p className="form-error">{error ?? '注文が見つかりません'}</p></div>;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">注文詳細</h1>
        <Link to="/orders" className="btn btn--secondary">← 一覧に戻る</Link>
      </div>

      <div className="detail-grid">
        {/* 注文情報 */}
        <div className="card">
          <h2 className="card__title">顧客情報</h2>
          <dl className="detail-list">
            <dt>顧客名</dt><dd>{order.customer_name}</dd>
            {order.customer_kana && <><dt>フリガナ</dt><dd>{order.customer_kana}</dd></>}
            <dt>メール</dt><dd>{order.email}</dd>
            {order.tel && <><dt>電話番号</dt><dd>{order.tel}</dd></>}
            {order.zip && <><dt>郵便番号</dt><dd>{order.zip}</dd></>}
            {order.address && <><dt>住所</dt><dd>{order.address}</dd></>}
          </dl>
        </div>

        {/* ステータス更新 */}
        <div className="card">
          <h2 className="card__title">注文情報</h2>
          <dl className="detail-list">
            <dt>注文ID</dt><dd className="detail-list__id">{order.id}</dd>
            <dt>合計金額</dt><dd>¥{order.total_price.toLocaleString()}</dd>
            <dt>現在のステータス</dt><dd><StatusBadge status={order.status} /></dd>
            <dt>注文日時</dt><dd>{new Date(order.created_at).toLocaleString('ja-JP')}</dd>
            <dt>更新日時</dt><dd>{new Date(order.updated_at).toLocaleString('ja-JP')}</dd>
          </dl>

          <div className="status-update">
            <label className="form-label" htmlFor="status">ステータス変更</label>
            <div className="status-update__row">
              <select
                id="status"
                className="form-input form-input--select"
                value={editStatus || order.status}
                onChange={e => setEditStatus(e.target.value as OrderStatus)}
              >
                {STATUSES.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <button className="btn btn--primary" onClick={handleStatusUpdate} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
            {saveError && <p className="form-error">{saveError}</p>}
          </div>
        </div>
      </div>

      {/* 注文明細 */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card__title">注文明細</h2>
          <table className="table">
            <thead>
              <tr>
                <th>商品コード</th>
                <th>商品名</th>
                <th>数量</th>
                <th>単価</th>
                <th>小計</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item: any, i: number) => (
                <tr key={item.id}>
                  <td>{item.product_code}</td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>¥{item.unit_price.toLocaleString()}</td>
                  <td>¥{(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 削除ボタン */}
      <div className="danger-zone">
        <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? '削除中...' : 'この注文を削除'}
        </button>
      </div>
    </div>
  );
}
