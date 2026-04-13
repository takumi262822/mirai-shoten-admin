import request from 'supertest';
import app from '../src/index';

describe('注文API', () => {
  let token: string;

  beforeAll(async () => {
    // テスト用アカウントでログインしトークン取得
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mirai-shoten.com', password: 'Admin1234!' });
    token = loginRes.body.token;
  });

  it('GET /api/orders で注文一覧が取得できる', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    // 件数や内容の検証はダミーデータ状況に応じて調整
  });
});
