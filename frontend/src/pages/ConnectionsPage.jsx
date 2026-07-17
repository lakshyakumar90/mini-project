import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, UserMinus, Loader2, Users, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchConnections, removeExistingConnection } from '@/store/slices/connectionSlice';

const ConnectionsPage = () => {
  const dispatch = useDispatch();
  const { connections, loading, error, actionSuccess, actionError } = useSelector((state) => state.connections);
  const { user } = useSelector((state) => state.auth);

  const [removingId, setRemovingId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch, user]);

  useEffect(() => {
    if (actionSuccess || actionError) {
      setShowAlert(true);
      setRemovingId(null);

      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  const handleRemoveConnection = (userId) => {
    setRemovingId(userId);
    dispatch(removeExistingConnection(userId));
  };

  if (loading) {
    return (
      <div className="dub-card p-16 max-w-[1100px] mx-auto flex flex-col justify-center items-center space-y-3 text-muted-foreground my-6">
        <Loader2 className="animate-spin h-8 w-8 text-[#2563eb]" />
        <p className="text-xs font-geist">Loading verified developer network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dub-card p-8 max-w-[1100px] mx-auto bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm my-6">
        Error loading connections: {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Header Banner */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Mutual Peer Attribution
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            My Connections
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Manage your verified peer network, initiate direct collaborations, and jump right into real-time Socket.IO chat rooms.
          </p>
        </div>
        <div className="dub-pill py-1.5 px-4 bg-secondary text-foreground font-satoshi font-semibold text-sm shrink-0">
          {connections ? connections.length : 0} Verified Peers
        </div>
      </div>

      {showAlert && (
        <div className={`p-4 rounded-[12px] border text-xs sm:text-sm ${actionError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-[#16a34a]"}`}>
          {actionError || actionSuccess}
        </div>
      )}

      {connections && connections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connections.map((connection) => {
            if (!connection || !connection._id) return null;

            return (
              <div key={connection._id} className="dub-card p-5 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link to={`/user/${connection._id}`} className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 rounded-full border border-border shrink-0">
                        <AvatarImage src={connection.profilePicture} alt={connection.name || 'User'} />
                        <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                          {connection.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-satoshi font-semibold text-base text-foreground group-hover:text-[#2563eb] transition-colors">
                            {connection.name || 'Developer'}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{connection.role || 'Verified Engineer'}</p>
                      </div>
                    </Link>
                  </div>

                  {connection.bio && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {connection.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {connection.skills && Array.isArray(connection.skills) && connection.skills.length > 0 ? (
                      connection.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-[11px] font-geist text-foreground"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No stack tags listed</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                  <Link
                    to={`/chat?userId=${connection._id}`}
                    className="dub-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat Room</span>
                  </Link>

                  <button
                    className="dub-btn-outline text-xs py-1.5 px-3 text-red-500 hover:bg-red-500/10 border-red-500/20 flex items-center gap-1"
                    onClick={() => handleRemoveConnection(connection._id)}
                    disabled={removingId === connection._id}
                  >
                    {removingId === connection._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="h-3.5 w-3.5" />
                    )}
                    <span>{removingId === connection._id ? 'Removing...' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dub-card p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <Users className="w-6 h-6 text-[#2563eb]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-satoshi font-semibold text-lg text-foreground">No Connections Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              You don't have any verified peer connections yet. Browse the Developer Directory to connect with engineers.
            </p>
          </div>
          <Link to="/dashboard">
            <button className="dub-btn-primary text-xs py-2 px-4 mt-2">
              Explore Developer Directory
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;