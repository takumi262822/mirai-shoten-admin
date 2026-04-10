import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../services/authService';

const router = Router();

// ログインエンドポイントへのレートリミット（同一 IP から最大10回/分）
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'リクエストが多すぎます。しばらく後でお試しください。' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(422).json({ error: 'メールアドレスとパスワードは必須です' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(422).json({ error: 'メールアドレスの形式が正しくありません' });
    return;
  }

  const token = await login(email, password);

  if (!token) {
    // 存在しないユーザーと間違いパスワードを区別しないことで情報漏洩を防ぐ
    res.status(401).json({ error: 'メールアドレスまたはパスワードが違います' });
    return;
  }

  res.json({ token });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  // JWT はステートレスのため、サーバー側の処理は不要
  res.json({ message: 'ログアウトしました' });
});

export default router;
