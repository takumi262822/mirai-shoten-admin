import { getToken, removeToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * API へのリクエストを送る fetch ラッパー。
 * - Authorization: Bearer <JWT> ヘッダーを自動付与する
 * - 401 レスポンス時は自動ログアウトしてログイン画面へ遷移する
 * - レスポンスが ok でない場合はエラーをスローする
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('認証切れ');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
