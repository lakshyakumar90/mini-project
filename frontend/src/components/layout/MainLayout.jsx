import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '@/components/Navbar';
import socketService from '@/services/socketService';
import { fetchNotificationsThunk } from '@/store/slices/notificationSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      socketService.connect(user._id, dispatch);
      dispatch(fetchNotificationsThunk());
    }
    return () => {
      // Keep socket connected while user navigates between layout routes
    };
  }, [user, dispatch]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 relative overflow-x-hidden w-full">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-2.5 sm:p-6 overflow-y-auto overflow-x-hidden h-[calc(100vh-4rem)] w-full max-w-full no-scrollbar animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;