import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const RequestsPage = () => {
  // Mock connection requests data - replace with actual API call
  const requests = [
    {
      id: 1,
      name: 'David Lee',
      role: 'Mobile Developer',
      avatar: 'https://github.com/shadcn.png',
      mutualConnections: 5,
      message: 'Hi! I saw your React Native projects and would love to connect!',
    },
    {
      id: 2,
      name: 'Emma Davis',
      role: 'UX Designer',
      avatar: 'https://github.com/shadcn.png',
      mutualConnections: 3,
      message: 'Looking to collaborate on UI/UX projects with developers.',
    },
  ];

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Connection Requests</h1>
        <span className="text-sm text-muted-foreground">
          {requests.length} pending requests
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {requests.map((request) => (
          <motion.div
            key={request.id}
            variants={item}
            layout
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={request.avatar} alt={request.name} />
                    <AvatarFallback>{request.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <CardDescription>{request.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{request.message}</p>
                <p className="text-sm text-muted-foreground">
                  {request.mutualConnections} mutual connections
                </p>
              </CardContent>
              <CardFooter className="justify-end space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="space-x-2 text-destructive"
                >
                  <X className="h-4 w-4" />
                  <span>Decline</span>
                </Button>
                <Button size="sm" className="space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Accept</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {requests.length === 0 && (
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