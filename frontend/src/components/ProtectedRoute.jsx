import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function ProviderRoute({ children }) {
  const { user, isProvider } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isProvider) return <Navigate to="/" replace />;
  return children;
}

export function CustomerRoute({ children }) {
  const { user, isCustomer } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isCustomer) return <Navigate to="/" replace />;
  return children;
}
