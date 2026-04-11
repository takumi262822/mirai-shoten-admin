import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // URLのハッシュからaccess_tokenを取得
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const access_token = params.get('access_token');
    if (type === 'recovery' && access_token) {
      setToken(access_token);
    } else {
      setMessage('無効なリンクです。');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const { error } = await supabase.auth.updateUser(
      { password },
      { accessToken: token }
    );
    if (error) {
      setMessage('パスワード再設定に失敗しました: ' + error.message);
    } else {
      setMessage('パスワードが再設定されました。ログイン画面に戻ります。');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  if (!token) return <div>{message || 'トークンを確認中...'}</div>;

  return (
    <div className="page">
      <h1>パスワード再設定</h1>
      <form onSubmit={handleSubmit}>
        <label>
          新しいパスワード
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit">再設定</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
