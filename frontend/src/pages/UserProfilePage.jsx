import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, UserPlus } from 'lucide-react';
import { fetchUserProfile } from '@/store/slices/userProfileSlice';

const UserProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { userProfile, loading, error } = useSelector((state) => state.userProfile);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive">Error loading profile: {error}</p>
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Link to="/dashboard">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Developer Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/40"></div>
          <div className="relative px-6">
            <Avatar className="absolute -top-16 border-4 border-background w-32 h-32">
              <AvatarImage src={userProfile.profilePicture} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <CardHeader className="pt-20">
            <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
            <CardDescription>{userProfile.skills?.join(', ')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-muted-foreground">{userProfile.bio || 'No bio provided'}</p>
            </div>

            {userProfile.skills?.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button className="space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </Button>
              <Button variant="outline" className="space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;