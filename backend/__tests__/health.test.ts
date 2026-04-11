import request from 'supertest';
import app from '../src/index';

describe('ヘルスチェックAPI', () => {
  it('GET /api/health で 200 OK を返す', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
