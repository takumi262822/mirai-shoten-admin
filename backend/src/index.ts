import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import ordersRouter from './routes/orders';
import customersRouter from './routes/customers';
import statsRouter from './routes/stats';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// ミドルウェア設定
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']);
    const reqOrigin = origin ?? '';
    if (allowed.includes(reqOrigin)) return callback(null, true);
    // ワイルドカード対応
    if (allowed.some(o => o.includes('*') && new RegExp('^' + (o ?? '').replace('.', '\.').replace('*', '.*') + '$').test(reqOrigin))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ルーター登録

app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/stats', statsRouter);

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 集中エラーハンドラー（最後に登録）
app.use(errorHandler);


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`サーバー起動: http://localhost:${PORT}`);
  });
}


export default app;
