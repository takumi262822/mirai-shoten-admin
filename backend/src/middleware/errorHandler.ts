import { Request, Response, NextFunction } from 'express';

/**
 * Express の集中エラーハンドラー。
 * ルートハンドラーで next(err) を呼び出した際にここに到達する。
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
}
