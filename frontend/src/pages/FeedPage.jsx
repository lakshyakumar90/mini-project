import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, setTab, setTag } from '@/store/slices/postSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Plus, Flame, Clock, Filter, X, Code2, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/posts/PostCard';
import CreatePostModal from '@/components/posts/CreatePostModal';
import SkeletonCard from '@/components/ui/SkeletonCard';

const POPULAR_TAGS = ['React', 'Node.js', 'TypeScript', 'Python', 'Go', 'Next.js', 'ML', 'Rust', 'AI', 'Tailwind'];

const FeedPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, nextCursor, hasMore, loading, loadingMore, error, currentTab, selectedTag } = useSelector(
    (state) => state.posts
  );

  useEffect(() => {
    dispatch(fetchPosts({ tab: currentTab, tag: selectedTag, append: false }));
  }, [dispatch, currentTab, selectedTag]);

  const handleTabChange = (tab) => {
    if (tab !== currentTab) {
      dispatch(setTab(tab));
    }
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      dispatch(setTag(null));
    } else {
      dispatch(setTag(tag));
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && nextCursor) {
      dispatch(fetchPosts({ cursor: nextCursor, tab: currentTab, tag: selectedTag, append: true }));
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Header Banner */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span> Live Developer Stream
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            Community Feed & Snippets
          </h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="dub-btn-primary text-xs py-2 px-4 shrink-0 shadow-subtle"
        >
          <Code2 className="w-4 h-4 text-[#dcfce7]" />
          <span>Post Code Snippet / Update</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Center Feed (span 8 after removing left profile card) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Create Post Trigger Bar */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="dub-card p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group shadow-subtle w-full max-w-full overflow-hidden"
          >
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-border shrink-0">
              <AvatarImage src={user?.profilePicture} alt={user?.name} />
              <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs">
                {user?.name?.[0] || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-secondary group-hover:border-ring border border-border rounded-[8px] px-3 sm:px-4 py-2 sm:py-2.5 text-xs text-muted-foreground transition-all truncate">
              <span className="sm:hidden truncate">What are you building? Share a snippet...</span>
              <span className="hidden sm:inline">What are you building or debugging? Share a snippet or architectural thought...</span>
            </div>
            <button className="dub-btn-outline text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 text-[#2563eb] border-[#2563eb]/20 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          {/* Feed Header & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-[8px] border border-border">
              <button
                onClick={() => handleTabChange('recent')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                  currentTab === 'recent'
                    ? 'bg-card text-foreground shadow-subtle font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Recent Stream</span>
              </button>
              <button
                onClick={() => handleTabChange('top')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                  currentTab === 'top'
                    ? 'bg-card text-foreground shadow-subtle font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Top Attributions</span>
              </button>
            </div>

            {selectedTag && (
              <div className="flex items-center gap-1.5 bg-[#2563eb] text-white px-3 py-1 rounded-full text-xs font-geist shadow-subtle">
                <span>#{selectedTag}</span>
                <button onClick={() => dispatch(setTag(null))} className="hover:opacity-80">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Posts List */}
          {loading ? (
            <SkeletonCard count={3} showCode={true} />
          ) : error ? (
            <div className="dub-card p-8 text-center bg-red-500/10 border border-red-500/20 text-red-500 text-sm space-y-3">
              <p>{error}</p>
              <button
                onClick={() => dispatch(fetchPosts({ tab: currentTab }))}
                className="dub-btn-outline text-xs"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="dub-card p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
                <Sparkles className="w-6 h-6 text-[#2563eb]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-satoshi font-semibold text-lg text-foreground">No Snippets Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {selectedTag
                    ? `There are no posts tagged with #${selectedTag} yet. Be the first to share your implementation!`
                    : "The community hasn't posted anything here yet. Share what you're working on!"}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="dub-btn-primary text-xs py-2 px-4"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4 pb-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="dub-btn-outline text-xs px-6 py-2"
                  >
                    {loadingMore ? 'Loading more posts...' : 'Load More Snippets'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Tech Stack Filter & Directory (span 4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Tech Stack Filter */}
          <div className="dub-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-satoshi font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#2563eb]" /> Filter by Tech Stack
              </span>
              {selectedTag && (
                <button
                  onClick={() => dispatch(setTag(null))}
                  className="text-xs text-[#2563eb] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1 text-xs rounded-[6px] font-geist transition-all border ${
                    selectedTag === tag
                      ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-subtle'
                      : 'bg-secondary text-foreground border-border hover:border-ring'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Navigation Card */}
          <div className="dub-card p-5 space-y-3 bg-secondary">
            <div className="flex items-center gap-2 text-foreground font-satoshi font-semibold text-sm">
              <Compass className="w-4 h-4 text-[#2563eb]" />
              <span>Explore Network Directory</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover verified developers, inspect peer portfolios, and initiate direct real-time collaborations.
            </p>
            <Link to="/dashboard" className="block pt-1">
              <button className="dub-btn-outline w-full text-xs py-2 bg-card">
                Open Directory
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Create Post Slide-Over Modal */}
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};

export default FeedPage;
