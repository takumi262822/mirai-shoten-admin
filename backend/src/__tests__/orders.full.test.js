// orders.full.test.js
// バックエンドAPIのCRUD・認証・バリデーション・異常系テスト一式（Jest+Supertest）

const request = require('supertest');
const app = require('../index'); // Expressアプリ本体

// テスト用JWT（必要に応じて発行ロジックを追加）
const TEST_JWT = process.env.TEST_JWT || '';

// テスト用注文データ
const testOrder = {
  customer_name: 'テスト太郎',
  email: 'test@example.com',
  phone: '090-0000-0000',
  address: '東京都',
  status: 'pending',
  total_price: 1000
};

let createdOrderId;

describe('注文API CRUD & 異常系', () => {
  // GET: 認証なし→401
  it('認証なしGET /api/ordersは401', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(401);
  });

  // GET: 認証あり→200
  it('認証ありGET /api/ordersは200', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${TEST_JWT}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // POST: バリデーションエラー
  it('不正な注文データは422', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${TEST_JWT}`)
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  // POST: 正常登録
  it('注文を新規登録できる', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${TEST_JWT}`)
      .send(testOrder);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdOrderId = res.body.id;
  });

  // PUT: 更新
  it('注文を更新できる', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${TEST_JWT}`)
      .send({ status: 'completed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  // DELETE: 削除
  it('注文を削除できる', async () => {
    const res = await request(app)
      .delete(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${TEST_JWT}`);
    expect(res.statusCode).toBe(204);
  });

  // DELETE: 存在しないID→404
  it('存在しない注文削除は404', async () => {
    const res = await request(app)
      .delete(`/api/orders/xxxxxxxx`)
      .set('Authorization', `Bearer ${TEST_JWT}`);
    expect(res.statusCode).toBe(404);
  });
});
