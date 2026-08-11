import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../ui/LoadingState';

/**
 * Wraps admin routes. Redirects to /login if not authenticated.
 * Shows a loading spinner while the auth session is being resolved.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-secondary)]">
        <LoadingState message="Checking authentication…" />
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
