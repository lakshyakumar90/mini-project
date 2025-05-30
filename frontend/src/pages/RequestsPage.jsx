import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { fetchConnectionRequests, acceptRequest, rejectRequest } from '@/store/slices/connectionSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RequestsPage = () => {
  const dispatch = useDispatch();
  const { pendingRequests, loading, error, actionLoading, actionError, actionSuccess } = useSelector((state) => state.connections);
  console.log('Pending requests:', pendingRequests);

  const [processingId, setProcessingId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Fetch connection requests on component mount
  useEffect(() => {
    dispatch(fetchConnectionRequests());
  }, [dispatch]);

  // Log the pending requests for debugging
  console.log('Pending requests in component:', pendingRequests);

  // Show success/error alert when connection action completes
  useEffect(() => {
    if (actionSuccess || actionError) {
      setShowAlert(true);
      setProcessingId(null);

      // Hide alert after 3 seconds
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
        <p className="text-destructive">Error loading requests: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Connection Requests</h1>
        <span className="text-sm text-muted-foreground">
          {pendingRequests.length} pending requests
        </span>
      </div>

      {showAlert && (
        <Alert className={actionError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
          <AlertDescription className={actionError ? "text-red-700" : "text-green-700"}>
            {actionError || actionSuccess}
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {pendingRequests.map((request) => (
          <motion.div
            key={request._id}
            variants={item}
            layout
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={request.profilePicture} alt={request.name} />
                    <AvatarFallback>{request.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <CardDescription>{request.skills?.join(', ') || 'Developer'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{request.bio || `${request.name} wants to connect with you.`}</p>
              </CardContent>
              <CardFooter className="justify-end space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="space-x-2 text-destructive"
                  onClick={() => handleRejectRequest(request._id)}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>{processingId === request._id ? 'Declining...' : 'Decline'}</span>
                </Button>
                <Button
                  size="sm"
                  className="space-x-2"
                  onClick={() => handleAcceptRequest(request._id)}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{processingId === request._id ? 'Accepting...' : 'Accept'}</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {pendingRequests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No pending connection requests</p>
        </motion.div>
      )}
    </div>
  );
};

export default RequestsPage;