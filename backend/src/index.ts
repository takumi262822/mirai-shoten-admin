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



// 静的ファイル（index.html, favicon.ico等）をCORSより前にサーブ
app.use(express.static('public'));


// CORSはAPIリクエストのみ適用し、ルートやfaviconはスキップ
app.use((req, res, next) => {
  // 静的ファイルやAPI以外のリクエストはCORSをスキップ
  const skipCORS = (path: string) =>
    path === '/' ||
    /^\/(favicon\.(ico|png|jpg|svg)?|index\.html|robots\.txt|static\/.*)?$/.test(path) ||
    !path.startsWith('/api/');
  if (skipCORS(req.path) || skipCORS(req.originalUrl)) {
    return next();
  }
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']);
      const reqOrigin = origin ?? '';
      // Originが空(undefined)の場合は許可しない（本番用）
      if (!reqOrigin) {
        console.warn('[CORS拒否: origin空]', { reqOrigin, allowed });
        return callback(new Error('Not allowed by CORS'));
      }
      // 完全一致
      if (allowed.includes(reqOrigin)) return callback(null, true);
      // ワイルドカード対応: https://*.vercel.app など
      const wildcardPatterns = allowed
        .filter(o => o.includes('*'))
        .map(o => {
          // 例: https://*.vercel.app → ^https://([a-zA-Z0-9-]+\.)?vercel\.app$
          return new RegExp('^' + o
            .replace(/\./g, '\\.')
            .replace('*.', '([a-zA-Z0-9-]+\\.)?')
            .replace('*', '.*')
            + '$');
        });
      if (wildcardPatterns.some(re => re.test(reqOrigin))) {
        return callback(null, true);
      }
      // デバッグ用: 拒否時にOriginとallowedリストを出力
      console.warn('[CORS拒否] reqOrigin:', reqOrigin, '\nallowed:', allowed, '\npatterns:', wildcardPatterns.map(r=>r.toString()));
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })(req, res, next);
});
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
