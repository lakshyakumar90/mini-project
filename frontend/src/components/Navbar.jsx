import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Terminal, Menu } from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Left */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated && setSidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-1 rounded-lg lg:hidden text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-transparent hover:border-border"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-[8px] bg-[#2563eb] flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-subtle">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-satoshi font-semibold text-lg text-foreground tracking-tight">
              DevConnect
            </span>
          </Link>
          {/* <span className="dub-pill text-[11px] py-0.5 px-2 bg-secondary text-muted-foreground hidden sm:inline-flex border-border">
            SaaS Grid v2.5
          </span> */}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <NotificationBell />
              
              <Link to="/profile" className="hidden sm:flex items-center gap-2 group p-1 rounded-full hover:bg-secondary transition-all">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarImage src={user?.profilePicture} alt={user?.name?.[0] || 'U'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground hidden lg:inline group-hover:text-[#2563eb] transition-colors">
                  {user?.name ? user.name.split(' ')[0] : 'Developer'}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="dub-btn-outline text-xs py-2 px-4">
                Log in
              </Link>
              <Link to="/signup" className="dub-btn-dark text-xs py-2 px-4">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;