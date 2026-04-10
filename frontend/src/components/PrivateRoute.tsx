import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/auth';

/** JWT が存在しない場合は /login にリダイレクトする認証ガード */
export function PrivateRoute() {
  const token = getToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
