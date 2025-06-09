import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Suspense, useEffect } from 'react';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import RoutePreloader from './components/RoutePreloader';
import ProtectedRoute from './components/ProtectedRoute';

// Layout - Keep MainLayout non-lazy for better UX
import MainLayout from './components/layout/MainLayout';

// Redux actions
import { getCurrentUser } from './store/slices/authSlice';

// Enhanced lazy loading utility
import lazyLoad, { preloadComponents } from './utils/lazyLoad';

// Lazy load all pages with enhanced utility
const LandingPage = lazyLoad(() => import('./pages/LandingPage'));
const LoginPage = lazyLoad(() => import('./pages/LoginPage'));
const SignupPage = lazyLoad(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazyLoad(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyLoad(() => import('./pages/ResetPasswordPage'));
const TermsPage = lazyLoad(() => import('./pages/TermsPage'));
const PrivacyPage = lazyLoad(() => import('./pages/PrivacyPage'));
const ContactPage = lazyLoad(() => import('./pages/ContactPage'));
const NotFoundPage = lazyLoad(() => import('./pages/NotFoundPage'));

// Dashboard pages
const DashboardPage = lazyLoad(() => import('./pages/DashboardPage'));
const ConnectionsPage = lazyLoad(() => import('./pages/ConnectionsPage'));
const RequestsPage = lazyLoad(() => import('./pages/RequestsPage'));
const ChatPage = lazyLoad(() => import('./pages/ChatPage'));
const UserProfilePage = lazyLoad(() => import('./pages/UserProfilePage'));
const ProfilePage = lazyLoad(() => import('./pages/ProfilePage'));

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

const App = () => {
  const dispatch = useDispatch();
  // We don't need to use the auth state here since each component will handle its own redirects

  useEffect(() => {
    // Get current user on app load
    dispatch(getCurrentUser());
    initializeTheme();

    // Preload critical components for better UX
    preloadComponents([
      DashboardPage,
      ProfilePage,
      ConnectionsPage
    ]);
  }, [dispatch]);

  // Define route preloading map
  const routePreloadMap = {
    '/dashboard': [ConnectionsPage, ProfilePage],
    '/profile': [DashboardPage],
    '/connections': [ChatPage, RequestsPage],
    '/requests': [ConnectionsPage],
    '/chat': [ConnectionsPage],
    '/user': [ConnectionsPage, ChatPage],
  };

  return (
    <Router>
      <ErrorBoundary>
        {/* Route preloader component */}
        <RoutePreloader routeMap={routePreloadMap} />

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/user/:id" element={<UserProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
