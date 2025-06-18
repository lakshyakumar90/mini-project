import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { Home, Users, UserPlus, MessageSquare, UserCircle, Search } from "lucide-react";

const Sidebar = () => {
  // Safely access state with fallbacks
  const unreadCounts = useSelector((state) => state.chat?.unreadCounts || {});
  const pendingRequests = useSelector(
    (state) => state.connections?.pendingRequests || []
  );

  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (a, b) => a + b,
    0
  );

  const navItems = useMemo(() => [
    { to: "/dashboard", icon: Home, label: "Feed" },
    { to: "/search", icon: Search, label: "Search" },
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
      label: "Chat",
      badge: totalUnreadMessages,
    },
    { to: "/profile", icon: UserCircle, label: "My Profile" },
  ], [pendingRequests.length, totalUnreadMessages]);

  return (
    <div className="w-64 h-[calc(100vh-3.5rem)] border-r bg-background p-4 animate-in slide-in-from-left duration-300">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"
              }`
            }
          >
            <div className="transition-transform duration-200 hover:scale-110 active:scale-90">
              <item.icon className="h-5 w-5" />
            </div>
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs animate-in zoom-in duration-300">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
