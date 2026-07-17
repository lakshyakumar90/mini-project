import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Users, MessageSquare, UserPlus, Loader2, X, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import userService from '@/services/userService';
import { refreshNetworkState, sendRequest } from '@/store/slices/connectionSlice';

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { actionSuccess, actionError, connections, sentRequests } = useSelector((state) => state.connections);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [requestingUserId, setRequestingUserId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Debounce search to avoid too many API calls
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery, 1);
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  // Handle action feedback
  useEffect(() => {
    if (actionSuccess || actionError) {
      setShowAlert(true);
      setRequestingUserId(null);

      dispatch(refreshNetworkState());

      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError, dispatch]);

  const handleSearch = useCallback(async (query, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await userService.searchUsers(query.trim(), page, pagination.limit);
      
      if (page === 1) {
        setSearchResults(response.users);
      } else {
        setSearchResults(prev => [...prev, ...response.users]);
      }
      
      setPagination(response.pagination);
      setHasSearched(true);
    } catch (err) {
      setError(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages && !loading) {
      handleSearch(debouncedQuery, pagination.page + 1);
    }
  };

  const handleSendRequest = (userId) => {
    setRequestingUserId(userId);
    dispatch(sendRequest(userId))
      .then(() => setRequestingUserId(null))
      .catch(() => setRequestingUserId(null));
  };

  const hasSentRequest = (userId) => {
    if (!sentRequests || !Array.isArray(sentRequests)) return false;
    return sentRequests.some((u) => (u?._id || u?.id || u) === userId);
  };

  const isConnected = (userId) => {
    if (!connections || !Array.isArray(connections)) return false;
    return connections.some((u) => (u?._id || u?.id || u) === userId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError('');
    setSearchParams({});
  };

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Header Banner */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span> Global Index & Discovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            Search Developer Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Query the network by name, role title, or verified tech stack tag. Connect directly with peers across the ecosystem.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="dub-card p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, role, or tech stack tag (e.g., React, Go, Python, Machine Learning)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dub-input !pl-10 pr-10 text-xs sm:text-sm py-2.5"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {debouncedQuery && (
          <div className="mt-2.5 text-xs text-muted-foreground px-1 font-geist">
            {loading ? (
              <div className="flex items-center gap-2 text-[#2563eb]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Searching index for "{debouncedQuery}"...</span>
              </div>
            ) : hasSearched ? (
              <div>
                Found <strong className="text-foreground">{pagination.total}</strong> verified profile{pagination.total !== 1 ? 's' : ''} matching "{debouncedQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Action Feedback Alerts */}
      {showAlert && (
        <div className={`p-4 rounded-[12px] border text-xs sm:text-sm ${actionError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-[#16a34a]"}`}>
          {actionError || actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Search Results Grid */}
      {hasSearched && (
        <div className="space-y-6">
          {searchResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((developer) => (
                  <div key={developer._id} className="dub-card p-5 flex flex-col justify-between h-full group">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <Link to={`/user/${developer._id}`} className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 rounded-full border border-border shrink-0">
                            <AvatarImage src={developer.profilePicture} alt={developer.name || 'User'} />
                            <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                              {developer.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-satoshi font-semibold text-base text-foreground group-hover:text-[#2563eb] transition-colors">
                                {developer.name || 'Developer'}
                              </h3>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{developer.role || 'Verified Engineer'}</p>
                          </div>
                        </Link>
                      </div>

                      {developer.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {developer.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {developer.skills && Array.isArray(developer.skills) && developer.skills.length > 0 ? (
                          developer.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-[11px] font-geist text-foreground">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No stack tags listed</span>
                        )}
                        {developer.skills && developer.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-secondary text-[11px] font-geist text-muted-foreground">
                            +{developer.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                      <Link to={`/chat?userId=${developer._id}`} className="dub-btn-ghost text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>

                      {!isConnected(developer._id) && !hasSentRequest(developer._id) && (
                        <button
                          className="dub-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1"
                          onClick={() => handleSendRequest(developer._id)}
                          disabled={requestingUserId === developer._id}
                        >
                          {requestingUserId === developer._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                          )}
                          <span>{requestingUserId === developer._id ? 'Sending...' : 'Connect'}</span>
                        </button>
                      )}

                      {hasSentRequest(developer._id) && (
                        <button disabled className="dub-btn-outline text-xs py-1.5 px-3 border-border text-[#2563eb] bg-secondary cursor-default">
                          Request Sent
                        </button>
                      )}

                      {isConnected(developer._id) && (
                        <button disabled className="dub-btn-outline text-xs py-1.5 px-3 border-border text-[#16a34a] bg-secondary cursor-default">
                          Connected
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pagination.page < pagination.pages && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="dub-btn-outline text-xs px-6 py-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more...
                      </span>
                    ) : (
                      `Load More (${searchResults.length} of ${pagination.total})`
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="dub-card p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
                  <Users className="h-6 w-6 text-[#2563eb]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-satoshi font-semibold text-lg text-foreground">No Profiles Found</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    We couldn't find any verified developers matching "{debouncedQuery}". Try searching with different keywords or skills.
                  </p>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="dub-btn-outline text-xs py-2 px-4"
                >
                  Clear Search
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Empty State - Show when no search has been performed */}
      {!hasSearched && !debouncedQuery && (
        <div className="dub-card p-16 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <Search className="h-7 w-7 text-[#2563eb]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-satoshi font-semibold text-xl text-foreground">Explore the Developer Directory</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Enter a name or technical stack keyword above. You can filter by specific languages like "React", "Python", "Go" or find specific engineers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Machine Learning', 'DevOps'].map((skill) => (
              <button
                key={skill}
                onClick={() => setSearchQuery(skill)}
                className="px-3 py-1.5 rounded-full text-xs font-geist bg-secondary border border-border text-foreground hover:border-ring transition-all"
              >
                #{skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
