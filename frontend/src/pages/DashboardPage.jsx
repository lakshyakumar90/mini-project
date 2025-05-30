import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { fetchFeed } from '@/store/slices/feedSlice';
import { sendRequest } from '@/store/slices/connectionSlice';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users, pagination, loading, error } = useSelector((state) => state.feed);
  const { actionLoading, actionError, actionSuccess } = useSelector((state) => state.connections);

  const [requestingUserId, setRequestingUserId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  
  useEffect(() => {
    dispatch(fetchFeed({ page: 1, limit: 10 }));
  }, [dispatch]);

  
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

  
  useEffect(() => {
    if (user) {
      console.log('User data changed, refreshing feed');
      
      dispatch(fetchFeed({ page: 1, limit: 10 }));
    }
  }, [user, dispatch]);

  
  const [justSentRequests, setJustSentRequests] = useState([]);

  const handleSendRequest = (userId) => {
    setRequestingUserId(userId);
    dispatch(sendRequest(userId))
      .then((resultAction) => {
        if (sendRequest.fulfilled.match(resultAction)) {
          
          setJustSentRequests(prev => [...prev, userId]);
        }
      });
  };

  
  const hasSentRequest = (userId) => {
    
    if (justSentRequests.includes(userId)) {
      return true;
    }
    
    if (!user || !user.sentRequests) return false;
    return user.sentRequests.some(request => request._id === userId);
  };

  
  const isConnected = (userId) => {
    if (!user || !user.connections) return false;
    return user.connections.some(connection => connection._id === userId);
  };

  
  console.log('Current user data:', user);
  console.log('User connections:', user?.connections);

  
  const feedUsers = users
    .filter(feedUser => {
      
      if (feedUser._id === user?._id) return false;

      
      if (isConnected(feedUser._id)) {
        console.log(`Filtering out connected user: ${feedUser.name} (${feedUser._id})`);
        return false;
      }

      return true;
    })
    .map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.profilePicture,
      role: user.role || 'Developer',
      skills: user.skills || [],
      bio: user.bio || `Hello, I'm ${user.name}.`,
      timestamp: user.timestamp,
    }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive">Error loading developers: {error}</p>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Network</h1>
      </div>

      {showAlert && (
        <Alert className={actionError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
          <AlertDescription className={actionError ? "text-red-700" : "text-green-700"}>
            {actionError || actionSuccess}
          </AlertDescription>
        </Alert>
      )}

      {feedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-muted-foreground">No developers found in your network yet.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {feedUsers.map((user) => (
          <motion.div key={user.id} variants={item}>
            <Card className="h-full flex flex-col">
              <CardHeader className="text-center">
                <Link to={`/user/${user.id}`} className="hover:opacity-80 transition-opacity">
                  <Avatar className="w-20 h-20 mx-auto mb-2">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-2">{user.name}</CardTitle>
                  <CardDescription>{user.role}</CardDescription>
                </Link>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">{user.bio}</p>
                {user.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {user.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skills.length > 4 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                        +{user.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-center space-x-4 pt-2">
                {isConnected(user.id) ? (
                  <Button variant="outline" size="sm" className="space-x-2 text-green-600" disabled>
                    <Check className="h-4 w-4" />
                    <span>Connected</span>
                  </Button>
                ) : hasSentRequest(user.id) ? (
                  <Button variant="outline" size="sm" className="space-x-2 text-blue-600" disabled>
                    <Check className="h-4 w-4" />
                    <span>Request Sent</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="space-x-2"
                    onClick={() => handleSendRequest(user.id)}
                    disabled={requestingUserId === user.id}
                  >
                    {requestingUserId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    <span>{requestingUserId === user.id ? 'Sending...' : 'Connect'}</span>
                  </Button>
                )}
                {isConnected(user.id) ? (
                  <Link to={`/chat?userId=${user.id}`}>
                    <Button variant="outline" size="sm" className="space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Message</span>
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="space-x-2" disabled title="Connect first to message">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
