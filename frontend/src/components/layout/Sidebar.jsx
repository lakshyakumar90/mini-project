import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { Home, Users, UserPlus, MessageSquare, UserCircle } from "lucide-react";

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

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Feed" },
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
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-[calc(100vh-3.5rem)] border-r bg-background p-4"
    >
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
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <item.icon className="h-5 w-5" />
            </motion.div>
            <span>{item.label}</span>
            {item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs"
              >
                {item.badge}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
