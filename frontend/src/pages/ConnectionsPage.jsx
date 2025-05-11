import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserMinus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchConnections, removeExistingConnection } from '@/store/slices/connectionSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConnectionsPage = () => {
  const dispatch = useDispatch();
  const { connections, loading, error, actionLoading, actionError, actionSuccess } = useSelector((state) => state.connections);

  const [removingId, setRemovingId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Get the current user from the auth state
  const { user } = useSelector((state) => state.auth);

  // Fetch connections on component mount and when user data changes
  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch, user]);

  // Log connections for debugging
  console.log('Connections in component:', connections);
  console.log('Connections length:', connections.length);

  // Show success/error alert when connection action completes
  useEffect(() => {
    if (actionSuccess || actionError) {
      setShowAlert(true);
      setRemovingId(null);

      // Hide alert after 3 seconds
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
        <p className="text-destructive">Error loading connections: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Connections</h1>
        <span className="text-sm text-muted-foreground">
          {connections ? connections.length : 0} connections
        </span>
      </div>

      {showAlert && (
        <Alert className={actionError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
          <AlertDescription className={actionError ? "text-red-700" : "text-green-700"}>
            {actionError || actionSuccess}
          </AlertDescription>
        </Alert>
      )}

      {connections && connections.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {connections.map((connection) => {
            // Skip rendering if connection is null or doesn't have an _id
            if (!connection || !connection._id) return null;

            return (
              <motion.div key={connection._id} variants={item}>
                <Card>
                  <CardHeader className="text-center">
                    <Link to={`/user/${connection._id}`}>
                      <Avatar className="w-20 h-20 mx-auto hover:opacity-80 transition-opacity">
                        <AvatarImage src={connection.profilePicture} alt={connection.name || 'User'} />
                        <AvatarFallback>{connection.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="mt-4">{connection.name || 'Unknown User'}</CardTitle>
                      <CardDescription>{connection.role || 'Developer'}</CardDescription>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {connection.skills && Array.isArray(connection.skills) && connection.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!connection.skills || !Array.isArray(connection.skills) || connection.skills.length === 0) && (
                        <p className="text-sm text-muted-foreground">No skills listed</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center space-x-4">
                    <Link to={`/chat?userId=${connection._id}`}>
                      <Button variant="outline" size="sm" className="space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Message</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="space-x-2 text-destructive"
                      onClick={() => handleRemoveConnection(connection._id)}
                      disabled={removingId === connection._id}
                    >
                      {removingId === connection._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                      <span>{removingId === connection._id ? 'Removing...' : 'Remove'}</span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
      </motion.div>
      )}

      {(!connections || !Array.isArray(connections) || connections.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">You don't have any connections yet.</p>
          <p className="text-muted-foreground mt-2">
            Browse the <Link to="/dashboard" className="text-primary hover:underline">Developer Network</Link> to find people to connect with.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ConnectionsPage;