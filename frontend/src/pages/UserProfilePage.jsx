import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, UserPlus, MapPin, Sparkles, Code2, FolderGit2, ExternalLink, User, Check, Loader2 } from 'lucide-react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { fetchUserProfile } from '@/store/slices/userProfileSlice';
import { sendRequest } from '@/store/slices/connectionSlice';

const UserProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userProfile, loading, error } = useSelector((state) => state.userProfile);
  const { connections = [], sentRequests = [] } = useSelector((state) => state.connections);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserProfile(id));
    }
  }, [dispatch, id]);

  const handleConnect = () => {
    if (!userProfile?._id) return;
    setRequesting(true);
    dispatch(sendRequest(userProfile._id))
      .then(() => setRequesting(false))
      .catch(() => setRequesting(false));
  };

  const isSelf = user?._id === userProfile?._id;
  const isConnected = connections.some((u) => (u?._id || u?.id || u) === userProfile?._id) || user?.connections?.some((u) => (u?._id || u) === userProfile?._id);
  const hasSent = sentRequests.some((u) => (u?._id || u?.id || u) === userProfile?._id) || user?.sentRequests?.some((u) => (u?._id || u) === userProfile?._id);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive">Error loading profile: {error}</p>
        <Link to="/feed">
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
        <Link to="/feed">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Developer Profile</h1>
      </div>

      <div className="animate-in fade-in duration-500">
        <Card className="overflow-hidden border border-border/80 shadow-md">
          {(() => {
            const coverUrl = userProfile.coverImage || userProfile.coverPicture || userProfile.cover;
            const avatarUrl = userProfile.profilePicture || userProfile.avatar;
            return (
              <>
                <div 
                  className="h-44 bg-gradient-to-r from-primary/20 via-primary/30 to-purple-500/20 relative bg-cover bg-center border-b border-border"
                  style={coverUrl ? { backgroundImage: `url("${coverUrl}")` } : {}}
                />
                <div className="relative px-6">
                  <Avatar className="absolute -top-16 border-4 border-background w-32 h-32 shadow-lg bg-secondary">
                    <AvatarImage src={avatarUrl} alt={userProfile.name} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary font-satoshi">{userProfile.name?.[0] || 'D'}</AvatarFallback>
                  </Avatar>
                </div>
              </>
            );
          })()}
          
          <CardHeader className="pt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle className="text-2xl font-bold">{userProfile.name}</CardTitle>
                {userProfile.openToCollab && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="h-3 w-3" />
                    Open to Collab
                  </span>
                )}
              </div>
              <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="font-medium text-foreground/80">{userProfile.role || 'Developer'}</span>
                {userProfile.location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {userProfile.location}
                  </span>
                )}
              </CardDescription>
            </div>

            {!isSelf && (
              <div className="flex space-x-3">
                {isConnected ? (
                  <Button variant="outline" disabled className="space-x-2 border-emerald-500/30 text-emerald-500">
                    <Check className="h-4 w-4" />
                    <span>Connected</span>
                  </Button>
                ) : hasSent ? (
                  <Button variant="outline" disabled className="space-x-2">
                    <Check className="h-4 w-4" />
                    <span>Request Sent</span>
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={requesting} className="space-x-2 shadow transition-transform active:scale-95">
                    {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    <span>Connect</span>
                  </Button>
                )}
                <Link to="/chat">
                  <Button variant="outline" className="space-x-2 shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Button>
                </Link>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-7">
            {/* About Section */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-primary" />
                About
              </h3>
              <p className="text-muted-foreground leading-relaxed">{userProfile.bio || 'No bio provided'}</p>
            </div>

            {/* Skills Section */}
            {userProfile.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2.5 flex items-center gap-2 text-foreground">
                  <Code2 className="h-4 w-4 text-primary" />
                  Tech Stack & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned Projects Section */}
            {userProfile.pinnedProjects?.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                  Pinned Projects Showcase
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.pinnedProjects.map((project, idx) => (
                    <Card key={idx} className="p-4 bg-card/60 hover:bg-card transition-all duration-200 border border-border/80 shadow-sm flex flex-col justify-between space-y-3 group">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{project.title}</h4>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                          >
                            <span>Demo / Repo</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      {project.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.techStack.map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Stats Showcase if available */}
            {(userProfile.githubStats?.repos > 0 || userProfile.githubUsername) && (
              <div className="p-4 rounded-xl bg-accent/40 border border-border/80 space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                  <FaGithub className="h-5 w-5 text-foreground" />
                  GitHub Contribution Profile
                  {userProfile.githubUsername && <span className="text-xs font-normal text-muted-foreground">(@{userProfile.githubUsername})</span>}
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-background/80 rounded-lg border border-border/50">
                    <div className="text-xl font-bold text-primary">{userProfile.githubStats?.repos || '12+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Repositories</div>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg border border-border/50">
                    <div className="text-xl font-bold text-emerald-500">{userProfile.githubStats?.followers || '45+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Followers</div>
                  </div>
                  <div className="p-3 bg-background/80 rounded-lg border border-border/50">
                    <div className="text-xl font-bold text-purple-500">{userProfile.githubStats?.following || '30+'}</div>
                    <div className="text-xs text-muted-foreground font-medium">Following</div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h3 className="font-semibold text-lg text-foreground">Social Links</h3>
              <div className="flex flex-wrap gap-4">
                {userProfile.githubUrl ? (
                  <a
                    href={userProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 border border-border/80 font-medium text-sm shadow-sm"
                  >
                    <FaGithub className="h-4 w-4" />
                    GitHub Profile
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <FaGithub className="h-4 w-4" />
                    No GitHub profile linked
                  </span>
                )}

                {userProfile.linkedinUrl ? (
                  <a
                    href={userProfile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-200 border border-blue-500/20 font-medium text-sm shadow-sm"
                  >
                    <FaLinkedinIn className="h-4 w-4" />
                    LinkedIn Profile
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600/70 dark:text-blue-400/70" />
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <FaLinkedinIn className="h-4 w-4" />
                    No LinkedIn profile linked
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;