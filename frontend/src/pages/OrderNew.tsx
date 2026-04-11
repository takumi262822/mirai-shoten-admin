import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { validateOrderForm } from '../utils/validator';
import { OrderFormData, OrderItemFormData, OrderStatus } from '../types/index';

const EMPTY_ITEM: OrderItemFormData = {
  product_code: '',
  product_name: '',
  quantity: '1',
  unit_price: '0',
};

const INITIAL_FORM: OrderFormData = {
  customer_name: '',
  customer_kana: '',
  email: '',
  tel: '',
  zip: '',
  address: '',
  total_price: '0',
  status: 'pending',
  items: [{ ...EMPTY_ITEM }],
};

/** 注文追加画面 */
export default function OrderNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<OrderFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleField(field: keyof OrderFormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleItem(index: number, field: keyof OrderItemFormData, value: string) {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_: OrderItemFormData, i: number) => i !== index),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateOrderForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_kana: form.customer_kana,
          email: form.email,
          tel: form.tel,
          zip: form.zip,
          address: form.address,
          total_price: Number(form.total_price),
          status: form.status as OrderStatus,
          items: form.items.map((item: OrderItemFormData) => ({
            product_code: item.product_code,
            product_name: item.product_name,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          })),
        }),
      });
      navigate('/orders');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '注文の登録に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">新規注文登録</h1>
        <Link to="/orders" className="btn btn--secondary">← 一覧に戻る</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && <p className="form-error form-error--server">{serverError}</p>}

        <div className="card">
          <h2 className="card__title">顧客情報</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_name">顧客名 *</label>
              <input id="customer_name" className={`form-input ${errors.customer_name ? 'form-input--error' : ''}`}
                value={form.customer_name} onChange={e => handleField('customer_name', e.target.value)} />
              {errors.customer_name && <p className="form-error">{errors.customer_name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="customer_kana">フリガナ</label>
              <input id="customer_kana" className="form-input"
                value={form.customer_kana} onChange={e => handleField('customer_kana', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">メールアドレス *</label>
              <input id="email" type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                value={form.email} onChange={e => handleField('email', e.target.value)} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tel">電話番号</label>
              <input id="tel" className="form-input"
                value={form.tel} onChange={e => handleField('tel', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="zip">郵便番号</label>
              <input id="zip" className="form-input"
                value={form.zip} onChange={e => handleField('zip', e.target.value)} />
            </div>
            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="address">住所</label>
              <input id="address" className="form-input"
                value={form.address} onChange={e => handleField('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card__title">注文情報</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="total_price">合計金額（円）</label>
              <input id="total_price" type="number" min="0" className={`form-input ${errors.total_price ? 'form-input--error' : ''}`}
                value={form.total_price} onChange={e => handleField('total_price', e.target.value)} />
              {errors.total_price && <p className="form-error">{errors.total_price}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">ステータス</label>
              <select id="status" className="form-input form-input--select"
                value={form.status} onChange={e => handleField('status', e.target.value)}>
                <option value="pending">受付中</option>
                <option value="processing">処理中</option>
                <option value="shipped">発送済み</option>
                <option value="delivered">配達完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card__header">
            <h2 className="card__title">注文明細</h2>
            <button type="button" className="btn btn--secondary btn--sm" onClick={addItem}>+ 追加</button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} className="item-row">
              <div className="form-group">
                <label className="form-label">商品コード</label>
                <input className="form-input" value={item.product_code}
                  onChange={e => handleItem(i, 'product_code', e.target.value)} />
              </div>
              <div className="form-group form-group--wide">
                <label className="form-label">商品名 *</label>
                <input className={`form-input ${errors[`items.${i}.product_name`] ? 'form-input--error' : ''}`}
                  value={item.product_name} onChange={e => handleItem(i, 'product_name', e.target.value)} />
                {errors[`items.${i}.product_name`] && (
                  <p className="form-error">{errors[`items.${i}.product_name`]}</p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">数量</label>
                <input type="number" min="1" max="999" className="form-input"
                  value={item.quantity} onChange={e => handleItem(i, 'quantity', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">単価（円）</label>
                <input type="number" min="0" className="form-input"
                  value={item.unit_price} onChange={e => handleItem(i, 'unit_price', e.target.value)} />
              </div>
              {form.items.length > 1 && (
                <button type="button" className="btn btn--danger btn--sm item-row__remove"
                  onClick={() => removeItem(i)}>削除</button>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? '登録中...' : '注文を登録'}
          </button>
        </div>
      </form>
    </div>
  );
}
