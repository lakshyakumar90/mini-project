import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Redux actions
import { getCurrentUser, clearAuthData } from './store/slices/authSlice';
import { setStoredToken, AUTH_EXPIRED_EVENT } from './services/apiClient';
import { refreshNetworkState } from './store/slices/connectionSlice';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard pages
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import ConnectionsPage from './pages/ConnectionsPage';
import RequestsPage from './pages/RequestsPage';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Picks up ?oauth=success&token=... on ANY route change (OAuth landing,
// or login?redirect=... loop) — persists token + refreshes auth + strips URL
const OAuthTokenHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get('token');
    if (params.get('oauth') === 'success' && oauthToken) {
      setStoredToken(oauthToken);
      dispatch(getCurrentUser());
      params.delete('token');
      params.delete('oauth');
      navigate(
        { pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' },
        { replace: true }
      );
    }
  }, [location, navigate, dispatch]);

  // Any API call that 401s with a token (expired/invalid session) lands here:
  // wipe auth state and bounce to login instead of showing raw errors
  useEffect(() => {
    const handleExpired = () => {
      dispatch(clearAuthData());
      navigate('/login?session=expired', { replace: true });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [navigate, dispatch]);

  return null;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Get current user on app load (Bearer token attached via interceptor)
    dispatch(getCurrentUser());
    initializeTheme();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(refreshNetworkState(true));
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <ErrorBoundary>
        <OAuthTokenHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
