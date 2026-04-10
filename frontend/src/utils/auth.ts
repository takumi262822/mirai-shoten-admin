/** JWT トークンを localStorage に保存する */
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

/** localStorage から JWT トークンを取得する */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/** localStorage から JWT トークンを削除する */
export function removeToken(): void {
  localStorage.removeItem('token');
}
