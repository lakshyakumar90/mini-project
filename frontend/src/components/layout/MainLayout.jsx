import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '@/components/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)] no-scrollbar animate-in slide-in-from-right-4 duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;