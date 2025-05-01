import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConnectionsPage = () => {
  // Mock connections data - replace with actual API call
  const connections = [
    {
      id: 1,
      name: 'Alice Johnson',
      role: 'Frontend Developer',
      avatar: 'https://github.com/shadcn.png',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      mutualConnections: 12,
    },
    {
      id: 2,
      name: 'Bob Wilson',
      role: 'Backend Developer',
      avatar: 'https://github.com/shadcn.png',
      skills: ['Node.js', 'Python', 'MongoDB'],
      mutualConnections: 8,
    },
    {
      id: 3,
      name: 'Carol Brown',
      role: 'Full Stack Developer',
      avatar: 'https://github.com/shadcn.png',
      skills: ['React', 'Node.js', 'PostgreSQL'],
      mutualConnections: 15,
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
        <h1 className="text-3xl font-bold">My Connections</h1>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {connections.map((connection) => (
          <motion.div key={connection.id} variants={item}>
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage src={connection.avatar} alt={connection.name} />
                  <AvatarFallback>{connection.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">{connection.name}</CardTitle>
                <CardDescription>{connection.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {connection.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {connection.mutualConnections} mutual connections
                </p>
              </CardContent>
              <CardFooter className="justify-center space-x-4">
                <Link to="/chat">
                  <Button variant="outline" size="sm" className="space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="space-x-2 text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Remove</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ConnectionsPage;