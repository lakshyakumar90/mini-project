import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMemo } from "react";
import { logoutUser } from "@/store/slices/authSlice";
import { 
  Users, UserPlus, MessageSquare, UserCircle, Search, 
  Sparkles, Briefcase, Compass, ShieldCheck, Terminal, X, LogOut 
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadCounts = useSelector((state) => state.chat?.unreadCounts || {});
  const pendingRequests = useSelector(
    (state) => state.connections?.pendingRequests || []
  );

  const handleLogout = () => {
    if (setSidebarOpen) setSidebarOpen(false);
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (a, b) => a + b,
    0
  );

  const navItems = useMemo(() => [
    { to: "/feed", icon: Sparkles, label: "Feed & Updates" },
    { to: "/dashboard", icon: Compass, label: "Network Directory" },
    { to: "/jobs", icon: Briefcase, label: "Jobs & Opportunities" },
    { to: "/search", icon: Search, label: "Search & Discovery" },
    { to: "/connections", icon: Users, label: "Connections" },
    {
      to: "/requests",
      icon: UserPlus,
      label: "Requests",
      badge: pendingRequests.length,
    },
    {
      to: "/chat",
      icon: MessageSquare,
      label: "Direct Chat",
      badge: totalUnreadMessages,
    },
    { to: "/profile", icon: UserCircle, label: "My Profile" },
  ], [pendingRequests.length, totalUnreadMessages]);

  const renderNavContent = (isMobile = false) => (
    <div className="h-full flex flex-col justify-between select-none">
      <div className="space-y-6">
        <div className="px-3 flex items-center justify-between">
          <p className="text-[11px] font-satoshi font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation Hub
          </p>
          {isMobile && setSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => isMobile && setSidebarOpen && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs transition-all font-inter ${
                    isActive
                      ? "bg-[#2563eb] text-white font-semibold shadow-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-[#2563eb] text-white font-geist rounded-full px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 mt-4">
        {/* Socket.IO Status Card */}
        <div className="p-3.5 rounded-[12px] bg-secondary border border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
            <span className="text-[11px] font-satoshi font-semibold text-foreground">
              Socket.IO Active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Real-time updates enabled across chat, posts, and developer connections.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="dub-btn-outline w-full py-2.5 px-3.5 text-xs flex items-center justify-center gap-2 text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 border-red-500/20 transition-all font-inter font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Account</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 h-[calc(100vh-4rem)] border-r border-border bg-card p-4 flex-col justify-between shrink-0 select-none overflow-y-auto no-scrollbar">
        {renderNavContent(false)}
      </aside>

      {/* Mobile/Tablet Slide-over Drawer (positioned below the h-16 Navbar) */}
      <div
        className={`fixed top-16 left-0 right-0 bottom-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sliding Sidebar Drawer from left */}
        <aside
          className={`relative z-10 w-72 max-w-[85vw] h-full bg-card border-r border-border p-4 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderNavContent(true)}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
