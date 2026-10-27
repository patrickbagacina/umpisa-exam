import { Route, Routes } from 'react-router';
import { LoginPage } from '../auth/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Layout } from '../components/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { ItemsPage } from '../pages/ItemsPage';
import { NewItemPage } from '../pages/NewItemPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="items/new" element={<NewItemPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
