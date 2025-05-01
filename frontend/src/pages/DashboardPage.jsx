import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share2 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  useEffect(()=>{
    console.log(user);
  },[user]);

  // Mock feed data - replace with actual API call
  const feedPosts = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
        role: 'Full Stack Developer',
      },
      content: 'Looking for a React developer to collaborate on an open-source project! #reactjs #opensource',
      likes: 24,
      comments: 8,
      timestamp: '2h ago',
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: 'https://github.com/shadcn.png',
        role: 'UI/UX Designer',
      },
      content: 'Just launched my new portfolio website using Next.js and Tailwind CSS. Check it out! #webdev #portfolio',
      likes: 42,
      comments: 12,
      timestamp: '4h ago',
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
        <h1 className="text-3xl font-bold">Feed</h1>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6"
      >
        {feedPosts.map((post) => (
          <motion.div key={post.id} variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{post.user.name}</CardTitle>
                    <CardDescription>{post.user.role}</CardDescription>
                  </div>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {post.timestamp}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{post.content}</p>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default DashboardPage;