import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './AuthContext';

/** Renders child routes only with a session; otherwise redirects to /login, remembering the page. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
