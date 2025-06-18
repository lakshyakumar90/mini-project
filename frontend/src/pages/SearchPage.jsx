import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Users, MessageSquare, UserPlus, Loader2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import userService from '@/services/userService';
import { sendRequest } from '@/store/slices/connectionSlice';

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { actionSuccess, actionError } = useSelector((state) => state.connections);  // Local state
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
  }, [searchQuery]);  // Perform search when debounced query changes
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

      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

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
    dispatch(sendRequest(userId));
  };

  const hasSentRequest = (userId) => {
    if (!user || !user.sentRequests) return false;
    return user.sentRequests.some(request => request._id === userId);
  };

  const isConnected = (userId) => {
    if (!user || !user.connections) return false;
    return user.connections.some(connection => connection._id === userId);
  };
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError('');
    setSearchParams({});
  };
  return (
    <div className="space-y-8">      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Search className="h-8 w-8 text-primary" />
          Search Developers
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find developers by name or skills. Connect with like-minded professionals and build your network.
        </p>
      </div>      {/* Search Bar */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or skills (e.g., React, JavaScript, John Doe)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {debouncedQuery && (
            <div className="mt-3 text-sm text-muted-foreground">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching for "{debouncedQuery}"...
                </div>
              ) : hasSearched ? (
                <div>
                  Found {pagination.total} result{pagination.total !== 1 ? 's' : ''} for "{debouncedQuery}"
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Feedback */}
      {showAlert && (
        <Alert className={`max-w-2xl mx-auto ${actionError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <AlertDescription className={actionError ? "text-red-700" : "text-green-700"}>
            {actionError || actionSuccess}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {hasSearched && (        <div className="space-y-6">
          {searchResults.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
                {searchResults.map((developer, index) => (
                  <div key={developer._id} className={`animate-in slide-in-from-bottom-4 duration-500 delay-${index * 50}`}>
                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="text-center">
                        <Link to={`/user/${developer._id}`}>
                          <Avatar className="w-20 h-20 mx-auto hover:opacity-80 transition-opacity">
                            <AvatarImage src={developer.profilePicture} alt={developer.name || 'User'} />
                            <AvatarFallback>{developer.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="mt-4 hover:text-primary transition-colors">
                            {developer.name || 'Unknown User'}
                          </CardTitle>
                          <CardDescription>{developer.role || 'Developer'}</CardDescription>
                        </Link>
                      </CardHeader>
                      
                      <CardContent className="flex-1">
                        {developer.bio && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {developer.bio}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {developer.skills && Array.isArray(developer.skills) && developer.skills.length > 0 ? (
                              developer.skills.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No skills listed</p>
                            )}
                            {developer.skills && developer.skills.length > 4 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                                +{developer.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="justify-center space-x-3">
                        <Link to={`/chat?userId=${developer._id}`}>
                          <Button variant="outline" size="sm" className="space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Message</span>
                          </Button>
                        </Link>
                        
                        {!isConnected(developer._id) && !hasSentRequest(developer._id) && (
                          <Button
                            size="sm"
                            className="space-x-2"
                            onClick={() => handleSendRequest(developer._id)}
                            disabled={requestingUserId === developer._id}
                          >
                            {requestingUserId === developer._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                            <span>
                              {requestingUserId === developer._id ? 'Sending...' : 'Connect'}
                            </span>
                          </Button>
                        )}
                        
                        {hasSentRequest(developer._id) && (
                          <Button size="sm" variant="outline" disabled>
                            Request Sent
                          </Button>
                        )}
                        
                        {isConnected(developer._id) && (
                          <Button size="sm" variant="outline" disabled>
                            Connected                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {pagination.page < pagination.pages && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="min-w-32"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <span className="ml-2 text-muted-foreground">
                          ({searchResults.length} of {pagination.total})
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            !loading && (              <div className="text-center py-12 animate-in fade-in duration-500">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No developers found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any developers matching "{debouncedQuery}". 
                  Try searching with different keywords or skills.
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="mt-4"                >
                  Clear Search
                </Button>
              </div>
            )
          )}
        </div>
      )}

      {/* Empty State - Show when no search has been performed */}
      {!hasSearched && !debouncedQuery && (        <div className="text-center py-16 animate-in fade-in duration-500">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Enter a name or skill in the search box above to find developers. 
            You can search for skills like "React", "Python", "UI/UX" or by developer names.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['React', 'Node.js', 'Python', 'UI/UX', 'DevOps'].map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(skill)}
                className="hover:bg-primary hover:text-primary-foreground"
              >                {skill}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
