import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, UserPlus, Check, Loader2, Search, Sparkles, Plus, 
  Briefcase, Code2, Users, ExternalLink, LayoutGrid, List, Terminal, 
  ShieldCheck, Star, ArrowRight, X, Layers
} from 'lucide-react';
import { fetchFeed } from '@/store/slices/feedSlice';
import { sendRequest } from '@/store/slices/connectionSlice';
import SlideOver from '@/components/ui/SlideOver';
import CreatePostModal from '@/components/posts/CreatePostModal';
import CreateJobModal from '@/components/jobs/CreateJobModal';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { users, loading, error } = useSelector((state) => state.feed);
  const { actionLoading, actionError, actionSuccess, connections = [], sentRequests = [], pendingRequests = [] } = useSelector((state) => state.connections);

  const [requestingUserId, setRequestingUserId] = useState(null);
  const [justSentRequests, setJustSentRequests] = useState([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Slide-Over Modals State (replaces popups)
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [isPostSlideOverOpen, setIsPostSlideOverOpen] = useState(false);
  const [isJobSlideOverOpen, setIsJobSlideOverOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, limit: 30 }));
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchFeed({ page: 1, limit: 30 }));
    }
  }, [user, dispatch]);

  const handleSendRequest = (userId) => {
    setRequestingUserId(userId);
    dispatch(sendRequest(userId))
      .then((res) => {
        if (res?.success) {
          setJustSentRequests((prev) => [...prev, userId]);
        }
        setRequestingUserId(null);
      })
      .catch(() => {
        setRequestingUserId(null);
      });
  };

  const hasSentRequest = (userId) => {
    if (justSentRequests.includes(userId)) return true;
    if (sentRequests.some((u) => (u?._id || u?.id || u) === userId)) return true;
    if (!user || !user.sentRequests) return false;
    return user.sentRequests.some((request) => (request._id || request) === userId);
  };

  const isConnected = (userId) => {
    if (connections.some((u) => (u?._id || u?.id || u) === userId)) return true;
    if (!user || !user.connections) return false;
    return user.connections.some((connection) => (connection._id || connection) === userId);
  };

  const feedUsers = useMemo(() => {
    return users
      .filter((feedUser) => {
        if (feedUser._id === user?._id) return false;
        if (isConnected(feedUser._id)) return false;
        return true;
      })
      .map((u) => ({
        id: u._id,
        name: u.name || 'Developer',
        avatar: u.profilePicture,
        role: u.role || 'Full Stack Engineer',
        skills: u.skills || ['React', 'Node.js', 'TypeScript', 'Tailwind'],
        bio: u.bio || `Passionate software developer building scalable systems and open-source tools.`,
        githubUsername: u.githubUsername || '',
        timestamp: u.timestamp,
        openToCollab: u.openToCollab !== false
      }));
  }, [users, user, justSentRequests]);

  // Filtered Users based on Search & Tags
  const filteredUsers = useMemo(() => {
    return feedUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.bio.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'All' ||
        (selectedTag === 'Open to Collab' && u.openToCollab) ||
        u.skills.some((s) => s.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [feedUsers, searchQuery, selectedTag]);

  const popularStackTags = ['All', 'Open to Collab', 'React', 'TypeScript', 'Python', 'Go', 'Node.js', 'Rust'];

  return (
    <div className="space-y-10 font-inter max-w-[1200px] mx-auto pb-16 animate-fade-bg-in">
      {/* 1. Hero / Header Panel */}
      <div className="dub-card-paper p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden w-full max-w-full">
        <div className="space-y-3 z-10 max-w-2xl w-full">
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            <span className="dub-pill text-xs py-1 px-3 max-w-full truncate">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0"></span>
              <span className="truncate">Real-Time Attribution Portal</span>
            </span>
            <span className="dub-pill text-xs py-1 px-3 text-[#16a34a] max-w-full truncate">
              🔥 {feedUsers.length} Developers Available
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-satoshi font-semibold text-foreground tracking-tight leading-tight">
            Developer Network & Discovery
          </h1>
          
          <p className="text-muted-foreground text-sm font-inter leading-relaxed">
            Explore verified engineers, inspect technical stacks, and initiate collaboration requests. All containers follow 1px structural lines for high-density clarity.
          </p>
        </div>

        {/* Quick Actions (Slide-Over triggers) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => setIsPostSlideOverOpen(true)}
            className="dub-btn-outline text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-subtle"
          >
            <Code2 className="w-4 h-4 text-[#2563eb]" />
            <span>Post Update / Snippet</span>
          </button>

          <button
            onClick={() => setIsJobSlideOverOpen(true)}
            className="dub-btn-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2 shadow-subtle"
          >
            <Briefcase className="w-4 h-4 text-[#dcfce7]" />
            <span>Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar (Flat Cards with Hairline Borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dub-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Connections</span>
            <p className="text-2xl font-satoshi font-semibold text-foreground">
              {user?.connections?.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="dub-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Requests</span>
            <p className="text-2xl font-satoshi font-semibold text-foreground">
              {user?.receivedRequests?.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/20 flex items-center justify-center text-[#ea580c]">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="dub-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discovered Stack</span>
            <p className="text-2xl font-satoshi font-semibold text-foreground">
              {feedUsers.length} <span className="text-xs font-inter font-normal text-muted-foreground">engineers</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center text-[#2563eb]">
            <Terminal className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="dub-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or tech stack tag (e.g. React, Go, Python)..."
              className="dub-input !pl-10 text-sm py-2.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Layout:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[6px] border text-xs transition-all flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-[6px] border text-xs transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table Rows</span>
            </button>
          </div>
        </div>

        {/* Pill Tag Cluster */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {popularStackTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap shrink-0 ${
                selectedTag === tag
                  ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-subtle'
                  : 'bg-secondary text-foreground border-border hover:border-ring'
              }`}
            >
              {tag === 'Open to Collab' && <span className="mr-1 text-[#16a34a]">●</span>}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Content Surface (Grid or Table) */}
      {loading ? (
        <div className="dub-card p-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563eb]" />
          <p className="text-xs font-geist">Loading network attribution data...</p>
        </div>
      ) : error ? (
        <div className="dub-card p-8 bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm">
          Error loading network: {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="dub-card p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-satoshi font-semibold text-lg text-foreground">No Developers Found</h3>
            <p className="text-xs text-muted-foreground">No profiles matched your exact query or tag filter.</p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTag('All'); }}
            className="dub-btn-outline text-xs py-2 px-4"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="dub-card p-5 flex flex-col justify-between h-full group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div 
                    onClick={() => setSelectedDeveloper(u)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="w-12 h-12 rounded-full border border-border">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback className="bg-secondary text-foreground font-semibold text-sm">
                        {u.name?.[0] || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-satoshi font-semibold text-base text-foreground group-hover:text-[#2563eb] transition-colors">
                          {u.name}
                        </h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" title="Verified Engineer" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-inter">{u.role}</p>
                    </div>
                  </div>

                  {u.openToCollab && (
                    <span className="dub-pill bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 text-[11px] py-0.5 px-2 shrink-0">
                      Collab
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-inter">
                  {u.bio}
                </p>

                {/* Tech Stack Pills (Geist Mono) */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {u.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-[11px] font-geist text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {u.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-secondary text-[11px] font-geist text-muted-foreground">
                      +{u.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setSelectedDeveloper(u)}
                  className="dub-btn-ghost text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground"
                >
                  Quick View
                </button>

                <div className="flex items-center gap-2">
                  {hasSentRequest(u.id) ? (
                    <button disabled className="dub-btn-outline text-xs py-1.5 px-3 border-border text-[#2563eb] bg-secondary cursor-default">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>Sent</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(u.id)}
                      disabled={requestingUserId === u.id}
                      className="dub-btn-primary text-xs py-1.5 px-3.5"
                    >
                      {requestingUserId === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="dub-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/80 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="py-3.5 px-5">Developer</th>
                  <th className="py-3.5 px-4">Role & Status</th>
                  <th className="py-3.5 px-4">Technical Stack (Monospace)</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="py-4 px-5">
                      <div 
                        onClick={() => setSelectedDeveloper(u)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <Avatar className="w-10 h-10 rounded-full border border-border">
                          <AvatarImage src={u.avatar} alt={u.name} />
                          <AvatarFallback className="bg-secondary text-foreground font-semibold text-xs">
                            {u.name?.[0] || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-satoshi font-semibold text-foreground group-hover:text-[#2563eb] transition-colors">
                              {u.name}
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                          </div>
                          <p className="text-xs text-muted-foreground font-inter line-clamp-1 max-w-[200px]">{u.bio}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">{u.role}</p>
                        {u.openToCollab ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span> Open to Collab
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            Employed / Busy
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {u.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-[4px] bg-secondary border border-border text-[11px] font-geist text-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDeveloper(u)}
                        className="dub-btn-outline text-xs py-1.5 px-3"
                      >
                        Inspect
                      </button>

                      {hasSentRequest(u.id) ? (
                        <button disabled className="dub-btn-outline text-xs py-1.5 px-3 text-[#2563eb] bg-secondary cursor-default inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Sent
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(u.id)}
                          disabled={requestingUserId === u.id}
                          className="dub-btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1"
                        >
                          {requestingUserId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          Connect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SLIDE-OVER: Developer Profile Inspection */}
      <SlideOver
        isOpen={!!selectedDeveloper}
        onClose={() => setSelectedDeveloper(null)}
        title={selectedDeveloper?.name || 'Developer Profile'}
        subtitle={selectedDeveloper?.role || 'Verified Engineer'}
        size="md"
        footer={
          selectedDeveloper && (
            <>
              <button
                onClick={() => setSelectedDeveloper(null)}
                className="dub-btn-outline text-xs"
              >
                Close
              </button>
              <Link
                to={`/user/${selectedDeveloper.id}`}
                className="dub-btn-outline text-xs text-[#2563eb] border-[#2563eb]/30 hover:bg-[#2563eb]/10"
              >
                Full Page Profile <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
              {hasSentRequest(selectedDeveloper.id) ? (
                <button disabled className="dub-btn-outline text-xs text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/30">
                  <Check className="w-3.5 h-3.5 mr-1" /> Request Pending
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSendRequest(selectedDeveloper.id);
                  }}
                  disabled={requestingUserId === selectedDeveloper.id}
                  className="dub-btn-primary text-xs px-5"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Connect
                </button>
              )}
            </>
          )
        }
      >
        {selectedDeveloper && (
          <div className="space-y-6 font-inter">
            {/* Header Identity Card */}
            <div className="p-5 rounded-[16px] bg-secondary border border-border flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-full border border-border shrink-0">
                <AvatarImage src={selectedDeveloper.avatar} alt={selectedDeveloper.name} />
                <AvatarFallback className="bg-card text-foreground font-semibold text-lg">
                  {selectedDeveloper.name?.[0] || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-satoshi font-semibold text-lg text-foreground">
                    {selectedDeveloper.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{selectedDeveloper.role}</p>
                {selectedDeveloper.openToCollab && (
                  <span className="dub-pill bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 text-[11px] py-0.5 px-2">
                    ● Open for Collaboration
                  </span>
                )}
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Engineering Summary</h4>
              <p className="text-sm text-foreground leading-relaxed bg-card p-4 rounded-[12px] border border-border">
                {selectedDeveloper.bio}
              </p>
            </div>

            {/* Technical Stack Tags (Geist Mono) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified Technical Stack</h4>
              <div className="flex flex-wrap gap-2 p-4 rounded-[12px] bg-secondary border border-border">
                {selectedDeveloper.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-[6px] bg-card border border-border text-xs font-geist text-foreground shadow-subtle"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub Attribution Section */}
            <div className="p-4 rounded-[12px] border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#2563eb]" /> Developer Activity & Attribution
                </span>
                <span className="text-[11px] text-[#16a34a] font-geist">● Verified Live</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Profile synchronized via DevConnect real-time network. Connect directly to access private repositories, peer reviews, and open collaboration opportunities.
              </p>
            </div>
          </div>
        )}
      </SlideOver>

      {/* 6. SLIDE-OVER: Create Post */}
      <CreatePostModal
        isOpen={isPostSlideOverOpen}
        onClose={() => setIsPostSlideOverOpen(false)}
      />

      {/* 7. SLIDE-OVER: Create Job / Opportunity */}
      <CreateJobModal
        isOpen={isJobSlideOverOpen}
        onClose={() => setIsJobSlideOverOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
