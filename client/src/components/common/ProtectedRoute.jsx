import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * ProtectedRoute — Auth & role guard
 *
 * Props:
 *   children     {node}      — the page/layout to render
 *   allowedRoles {string[]}  — e.g. ['admin'] | ['parent'] | ['admin','teacher']
 *                             omit to allow any authenticated user
 *
 * Behaviour:
 *   - Shows spinner while auth state is loading
 *   - Redirects to /login if not authenticated (preserves attempted URL)
 *   - Redirects to /unauthorized if role doesn't match
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen text="Checking session..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;