import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderNew from './pages/OrderNew';
import Customers from './pages/Customers';
import ResetPassword from './pages/ResetPassword';
import './styles/app.css';

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// どんなURLでもrecoveryトークンがあれば自動で/reset-passwordに遷移するコンポーネント
function RecoveryRedirector() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // クエリパラメータ
    const searchParams = new URLSearchParams(location.search);
    // ハッシュパラメータ
    const hash = location.hash.replace('#', '');
    const hashParams = new URLSearchParams(hash);
    // recovery判定
    const type = searchParams.get('type') || hashParams.get('type');
    const token = searchParams.get('token') || hashParams.get('access_token') || hashParams.get('token');
    if (type === 'recovery' && token) {
      // ハッシュ優先でトークンを渡す
      const hashStr = hash ? `#${hash}` : '';
      navigate(`/reset-password${hashStr || location.search}`, { replace: true });
    }
  }, [location, navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RecoveryRedirector />
      <Routes>
        {/* 公開ルート */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 認証必須ルート */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<OrderNew />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/customers" element={<Customers />} />
          </Route>
        </Route>

        {/* デフォルトリダイレクト */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
