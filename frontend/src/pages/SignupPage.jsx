import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerUser, clearError } from '@/store/slices/authSlice';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getIntendedDestination, clearIntendedDestination } from '@/utils/redirectUtils';
import { Sparkles, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const { loading, error, isAuthenticated, isAuthChecking } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Only redirect if user is already authenticated when component mounts
  useEffect(() => {
    if (isAuthenticated && !isAuthChecking) {
      const destination = getIntendedDestination(searchParams);
      clearIntendedDestination();
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAuthChecking, navigate, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if ((name === 'password' || name === 'confirmPassword') && passwordError) {
      setPasswordError('');
    }

    if (error) dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    dispatch(registerUser({ name, email, password }))
      .then((resultAction) => {
        if (registerUser.fulfilled.match(resultAction)) {
          const destination = getIntendedDestination(searchParams);
          clearIntendedDestination();
          navigate(destination, { replace: true });
        }
      });
  };

  if (isAuthChecking) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-[#2563eb]/10 selection:text-[#2563eb]">
      <Navbar />

      <div className="container max-w-[1200px] mx-auto px-4 flex flex-col items-center justify-center py-16 min-h-[calc(100vh-70px)]">
        {/* Floating Feature Pill */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="dub-pill shadow-subtle border-border bg-card text-foreground text-xs py-1.5 px-4">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] mr-1.5"></span>
            Join the Developer Network
          </span>
        </div>

        <div className="w-full max-w-md bg-card border border-border rounded-[16px] shadow-[rgba(0,0,0,0.06)_0px_10px_25px_-5px,rgba(0,0,0,0.04)_0px_8px_10px_-6px] p-8 space-y-6 animate-in fade-in duration-500">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-satoshi font-semibold text-foreground tracking-tight">
              Create Developer Profile
            </h1>
            <p className="text-muted-foreground text-xs font-inter leading-relaxed">
              Connect with peers, showcase technical stack, and discover open projects.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <button
              type="button"
              className="dub-btn-outline w-full py-3 text-sm font-medium border-border hover:border-ring hover:bg-secondary transition-all shadow-subtle text-foreground"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3333/api'}/auth/github`;
              }}
            >
              <svg className="w-4 h-4 mr-1.5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t w-full border-border"></div>
              <span className="bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider absolute">
                Or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="dub-input font-medium"
                placeholder="Ada Lovelace"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="dub-input font-medium"
                placeholder="ada@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="dub-input font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="dub-input font-medium"
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="text-red-500 text-xs font-medium mt-1">{passwordError}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="dub-btn-primary w-full py-3 rounded-[8px] text-sm font-medium transition-all shadow-subtle flex items-center justify-center gap-2"
                disabled={loading}
              >
                <span>{loading ? 'Creating Identity...' : 'Join Developer Network'}</span>
                {!loading && <ArrowRight className="w-4 h-4 text-white/80" />}
              </button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-border text-xs text-muted-foreground">
            <span>Already registered? </span>
            <Link to="/login" className="text-[#2563eb] font-semibold hover:underline ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
