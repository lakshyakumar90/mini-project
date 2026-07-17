import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchConnectionRequests, acceptRequest, rejectRequest } from '@/store/slices/connectionSlice';

const RequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, loading, error, actionSuccess, actionError } = useSelector((state) => state.connections);

  const [processingId, setProcessingId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    dispatch(fetchConnectionRequests());
  }, [dispatch]);

  useEffect(() => {
    if (actionSuccess || actionError) {
      setShowAlert(true);
      setProcessingId(null);

      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  const handleAcceptRequest = (userId) => {
    setProcessingId(userId);
    dispatch(acceptRequest(userId));
  };

  const handleRejectRequest = (userId) => {
    setProcessingId(userId);
    dispatch(rejectRequest(userId));
  };

  if (loading) {
    return (
      <div className="dub-card p-16 max-w-[1100px] mx-auto flex flex-col justify-center items-center space-y-3 text-muted-foreground my-6">
        <Loader2 className="animate-spin h-8 w-8 text-[#2563eb]" />
        <p className="text-xs font-geist">Loading pending network requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dub-card p-8 max-w-[1100px] mx-auto bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm my-6">
        Error loading requests: {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Header Banner */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Inbound Network Invitations
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            Connection Requests
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Review incoming connection proposals from verified engineers across the platform. Accepted peers gain access to mutual messaging and private collaboration channels.
          </p>
        </div>
        <div className="dub-pill py-1.5 px-4 bg-secondary text-foreground font-satoshi font-semibold text-sm shrink-0">
          {pendingRequests ? pendingRequests.length : 0} Pending
        </div>
      </div>

      {showAlert && (
        <div className={`p-4 rounded-[12px] border text-xs sm:text-sm ${actionError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-[#16a34a]"}`}>
          {actionError || actionSuccess}
        </div>
      )}

      {pendingRequests && pendingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingRequests.map((request) => (
            <div
              key={request._id}
              className="dub-card p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <Link to={`/user/${request._id}`} className="flex items-center gap-3.5">
                  <Avatar className="w-12 h-12 rounded-full border border-border shrink-0">
                    <AvatarImage src={request.profilePicture} alt={request.name || 'User'} />
                    <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                      {request.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-satoshi font-semibold text-base text-foreground group-hover:text-[#2563eb] transition-colors">
                        {request.name || 'Developer'}
                      </h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{request.role || 'Verified Engineer'}</p>
                  </div>
                </Link>
              </div>

              {request.bio && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {request.bio}
                </p>
              )}

              {request.skills && Array.isArray(request.skills) && request.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {request.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-[11px] font-geist text-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  className="dub-btn-outline text-xs py-1.5 px-4 text-red-500 hover:bg-red-500/10 border-red-500/20 flex items-center gap-1.5"
                  onClick={() => handleRejectRequest(request._id)}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  <span>{processingId === request._id ? 'Declining...' : 'Decline'}</span>
                </button>
                <button
                  className="dub-btn-primary text-xs py-1.5 px-5 flex items-center gap-1.5"
                  onClick={() => handleAcceptRequest(request._id)}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>{processingId === request._id ? 'Accepting...' : 'Accept Request'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dub-card p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <UserCheck className="w-6 h-6 text-[#2563eb]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-satoshi font-semibold text-lg text-foreground">No Pending Invitations</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your inbound connection request inbox is currently clean. Check out the Developer Directory to connect with others.
            </p>
          </div>
          <Link to="/search">
            <button className="dub-btn-primary text-xs py-2 px-4 mt-2">
              Discover Peers
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;