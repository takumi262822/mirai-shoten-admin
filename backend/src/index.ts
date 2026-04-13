// ...existing code...
// ...existing code...
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

import authRouter from './routes/auth';
import ordersRouter from './routes/orders';
import customersRouter from './routes/customers';
import statsRouter from './routes/stats';
import libraryRouter from './library/routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);


// ...existing code...

// ミドルウェア設定
// ミドルウェア設定
// CORS全許可（緊急対応）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*'],
  credentials: true,
}));
app.use(express.json());


// ルート・faviconはCORS後に明示レスポンス
app.get('/', (_req, res) => {
  res.status(200).send('mirai-shoten-admin-backend APIサーバー\nこのURLはAPIサーバー単体のルートです。/api/以下でAPIを利用してください。');
});
app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.get('/favicon.png', (_req, res) => res.status(204).end());

// ルーター登録
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/stats', statsRouter);
app.use('/api', libraryRouter);

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 集中エラーハンドラー（最後に登録）
app.use(errorHandler);





export default app;
