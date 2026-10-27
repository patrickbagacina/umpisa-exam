import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="header">
        <div className="header__inner">
          <NavLink to="/" className="brand">
            Lost &amp; Found
          </NavLink>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/items" end>
              Items
            </NavLink>
            <NavLink to="/items/new">Log item</NavLink>
          </nav>
          <div className="header__user">
            {user && <span className="muted small">{user.email}</span>}
            <button type="button" className="button button--small" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="app">
        <Outlet />
      </main>
    </>
  );
}
