import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/auth';

/** 認証済み画面の共通レイアウト（サイドナビ + コンテンツエリア） */
export function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar__logo">未来商店<span>管理</span></div>
        <ul className="sidebar__nav">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              ダッシュボード
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              注文管理
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              顧客一覧
            </NavLink>
          </li>
        </ul>
        <button className="sidebar__logout" onClick={handleLogout}>
          ログアウト
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
