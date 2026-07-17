import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikeThunk, deletePostThunk, optimisticLikeToggle } from '@/store/slices/postSlice';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Trash2, Copy, Check, Code2, Users, Rocket, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Highlight, themes } from 'prism-react-renderer';
import PostComments from './PostComments';

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!post || !post.author) return null;

  const isAuthor = user && post.author._id === user._id;
  const isLiked = user && Array.isArray(post.likes) && post.likes.includes(user._id);
  const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
  const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

  const handleLike = () => {
    if (!user) return;
    // Optimistic toggle
    dispatch(optimisticLikeToggle({ postId: post._id, userId: user._id }));
    dispatch(toggleLikeThunk({ postId: post._id, userId: user._id }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePostThunk(post._id));
    }
  };

  const handleCopyCode = () => {
    if (post.codeSnippet && post.codeSnippet.code) {
      navigator.clipboard.writeText(post.codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'collab':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Users className="w-3 h-3 mr-1" /> Looking for Collaborators
          </span>
        );
      case 'project':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Rocket className="w-3 h-3 mr-1" /> Project Showcase
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border border-border/80 hover:border-border transition-all duration-200 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start space-x-3">
          <Link to={`/user/${post.author._id}`}>
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={post.author.profilePicture} alt={post.author.name} />
              <AvatarFallback>{post.author.name?.[0] || 'D'}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <Link to={`/user/${post.author._id}`} className="font-semibold text-sm hover:underline text-foreground">
                {post.author.name}
              </Link>
              {getTypeBadge(post.type)}
              {post.openToCollab && post.type !== 'collab' && (
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Open to Collab
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {post.author.role || 'Developer'} {post.author.location ? `• ${post.author.location}` : ''} •{' '}
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'just now'}
            </p>
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-red-500 p-1 rounded-md transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-3">
        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* Attached Image */}
        {post.image && (
          <div className="rounded-[12px] overflow-hidden border border-border my-3 w-full">
            <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[550px] object-cover block" loading="lazy" />
          </div>
        )}

        {/* Twitter/X-style Link Card Preview */}
        {(() => {
          const urlMatch = post.content?.match(/(https?:\/\/[^\s]+)/);
          if (!urlMatch) return null;
          const url = urlMatch[0];
          let domain = '';
          try { domain = new URL(url).hostname.replace('www.', ''); } catch (e) { domain = url; }
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block my-3 rounded-[12px] overflow-hidden border border-border bg-secondary/70 hover:bg-secondary transition-all group shadow-subtle"
            >
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-geist">
                    <ExternalLink className="h-3 w-3 text-[#2563eb] shrink-0" />
                    <span className="truncate">{domain}</span>
                  </div>
                  <p className="font-satoshi font-semibold text-sm text-foreground group-hover:text-[#2563eb] transition-colors truncate">
                    {url}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 font-inter">
                    Click to open preview and explore external developer resource on {domain}...
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors">
                  <ExternalLink className="h-4 w-4 text-[#2563eb]" />
                </div>
              </div>
            </a>
          );
        })()}

        {/* Code Snippet with Syntax Highlighting */}
        {post.codeSnippet && post.codeSnippet.code && post.codeSnippet.code.trim() !== '' && (
          <div className="relative rounded-[12px] overflow-hidden border border-border bg-secondary/30 dark:bg-[#1e1e2e] my-3 shadow-subtle">
            <div className="flex items-center justify-between px-3.5 py-2 bg-secondary/80 dark:bg-[#181825] border-b border-border text-xs text-muted-foreground font-mono">
              <span className="flex items-center font-geist">
                <Code2 className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {post.codeSnippet.language || 'code'}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center hover:text-foreground transition-colors p-1 font-geist"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3.5 overflow-x-auto text-xs font-mono font-geist">
              <Highlight
                theme={isDark ? themes.nightOwl : themes.github}
                code={post.codeSnippet.code}
                language={post.codeSnippet.language || 'javascript'}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre style={{ ...style, background: 'transparent', margin: 0 }} className={className}>
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })}>
                        <span className="inline-block w-6 select-none text-muted-foreground/40 text-[11px] mr-2 text-right">
                          {i + 1}
                        </span>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-border/50 flex flex-col items-stretch">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 text-xs font-medium transition-colors ${
                isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <PostComments
            postId={post._id}
            comments={post.comments || []}
            postAuthorId={post.author._id}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
