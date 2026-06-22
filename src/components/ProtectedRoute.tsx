import { Navigate, Outlet } from 'react-router-dom';
import { tokenStore } from '../api/client';

export function ProtectedRoute() {
  return tokenStore.get() ? <Outlet /> : <Navigate to="/login" replace />;
}
