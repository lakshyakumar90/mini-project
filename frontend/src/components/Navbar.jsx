import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import { logoutUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Determine if we're on the landing page or dashboard
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    dispatch(logoutUser())
      .then(() => {
        navigate('/');
      });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 items-center justify-between mx-auto">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="font-bold text-xl"
        >
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            DevTinder
          </Link>
        </motion.div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {isLandingPage && (
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
              <Link to="/profile">
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={user?.profilePicture} alt={user?.name?.[0] || 'U'} />
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              <Link to="/profile" className="hover:underline">
                <span className="text-sm font-medium hidden md:inline">
                  {user?.name ? user.name.split(' ')[0].replace(/^\w/, (c) => c.toUpperCase()) : ''}
                </span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-sm font-medium"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;