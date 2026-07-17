import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { markNotificationReadThunk, markAllNotificationsReadThunk, deleteNotificationThunk } from '@/store/slices/notificationSlice';
import { Bell, CheckCheck, Trash2, MessageSquare, UserPlus, Heart, Briefcase, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], unreadCount = 0, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (item) => {
    if (!item.read) {
      await dispatch(markNotificationReadThunk(item._id));
    }
    setIsOpen(false);

    // Route to appropriate destination based on type/entity
    if (item.type === 'new_message') {
      navigate('/chat');
    } else if (item.type === 'connection_request') {
      navigate('/requests');
    } else if (item.type === 'connection_accepted') {
      navigate(`/user/${item.sender?._id || item.sender}`);
    } else if (item.type === 'post_comment' || item.type === 'post_like') {
      navigate('/feed');
    } else if (item.type === 'job_application') {
      if (item.entityId) navigate(`/jobs/${item.entityId}`);
      else navigate('/jobs');
    } else {
      navigate(`/user/${item.sender?._id || item.sender}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      case 'post_like':
        return <Heart className="w-3.5 h-3.5 text-red-500" />;
      case 'job_application':
        return <Briefcase className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-accent text-foreground transition-all duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsReadThunk())}
                className="text-xs text-primary hover:underline flex items-center space-x-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p>You have no notifications yet.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className={`group flex items-start px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer relative ${
                    !item.read ? 'bg-primary/5 font-medium' : 'opacity-85'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative mr-3 shrink-0">
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarImage src={item.sender?.profilePicture} alt={item.sender?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {item.sender?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border border-border shadow-sm">
                      {getIcon(item.type)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs text-foreground leading-snug">
                      <span className="font-semibold">{item.sender?.name || 'Someone'}</span> {item.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>

                  {/* Unread dot & delete */}
                  <div className="flex flex-col items-end justify-between self-stretch ml-1">
                    {!item.read && <span className="w-2 h-2 rounded-full bg-primary mb-1"></span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(deleteNotificationThunk(item._id));
                      }}
                      className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border bg-muted/20 text-center">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center space-x-1 font-medium"
            >
              <span>Explore Developer Network</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
