import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';

/**
 * メールアドレスとパスワードで認証し、JWT を返す。
 * 認証失敗時は null を返す。
 */
export async function login(email: string, password: string): Promise<string | null> {
  // ユーザーを DB から取得（メールアドレスは大文字小文字を区別しない）
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !user) {
    return null;
  }

  // パスワードを bcrypt で検証
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return null;
  }

  // JWT を発行
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as Parameters<typeof jwt.sign>[2] extends { expiresIn?: infer E } ? E : never;
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn },
  );

  return token;
}
