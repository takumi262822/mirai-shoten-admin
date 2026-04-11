import request from 'supertest';
import app from '../src/index';

describe('注文API', () => {
  it('GET /api/orders で注文一覧が取得できる', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    // 件数や内容の検証はダミーデータ状況に応じて調整
  });
});
