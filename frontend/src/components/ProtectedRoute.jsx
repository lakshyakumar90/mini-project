import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getLoginRedirectUrl } from '@/utils/redirectUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login with current path
  if (!isAuthenticated) {
    const loginUrl = getLoginRedirectUrl(location.pathname + location.search);
    return <Navigate to={loginUrl} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
