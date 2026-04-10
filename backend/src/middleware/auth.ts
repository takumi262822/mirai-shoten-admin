import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

/**
 * JWT Bearer トークンを検証するミドルウェア。
 * Authorization: Bearer <token> ヘッダーが必須。
 * 検証成功時は req.user にペイロードをセットして next() を呼び出す。
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'トークンの有効期限が切れています' });
    } else {
      res.status(401).json({ error: '無効なトークンです' });
    }
  }
}
