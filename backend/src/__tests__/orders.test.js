// orders.test.js
// バックエンドAPI（注文エンドポイント）の簡易テストサンプル

const request = require('supertest');
const app = require('../index'); // Expressアプリ本体

describe('GET /api/orders', () => {
  it('注文一覧が配列で返る', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
