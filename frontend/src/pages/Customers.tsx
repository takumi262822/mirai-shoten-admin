import { useCustomers } from '../hooks/useCustomers';

/** 顧客一覧画面（注文データをメールで集計） */
export default function Customers() {
  const { customers, loading, error } = useCustomers();

  return (
    <div className="page">
      <h1 className="page__title">顧客一覧</h1>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="loading-text">読み込み中...</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>顧客名</th>
                <th>メールアドレス</th>
                <th>注文回数</th>
                <th>累計購入金額</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.email}>
                  <td>{customer.customer_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.orderCount} 回</td>
                  <td>¥{customer.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>顧客データがありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
