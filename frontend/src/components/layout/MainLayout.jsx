import { Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import LoadingSpinner from '@/components/LoadingSpinner';
import lazyLoad, { preloadComponents } from '@/utils/lazyLoad';

// Lazy load components with enhanced utility
const Sidebar = lazyLoad(() => import('./Sidebar'));
const Navbar = lazyLoad(() => import('@/components/Navbar'));

const MainLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Preload layout components for better UX
  useEffect(() => {
    if (isAuthenticated) {
      preloadComponents([Navbar, Sidebar]);
    }
  }, [isAuthenticated]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <Suspense fallback={<div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-14"></div>}>
        <Navbar />
      </Suspense>
      <div className="flex">
        <Suspense fallback={<div className="w-64 h-[calc(100vh-3.5rem)] border-r bg-background p-4"></div>}>
          <Sidebar />
        </Suspense>
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)] no-scrollbar"
        >
          <Suspense fallback={<div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>}>
            <Outlet />
          </Suspense>
        </motion.main>
      </div>
    </motion.div>
  );
};

export default MainLayout;