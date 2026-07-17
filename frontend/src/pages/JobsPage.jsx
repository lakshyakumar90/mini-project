import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobsThunk, setJobFilters, resetJobFilters } from '@/store/slices/jobSlice';
import { Briefcase, Plus, Search, Filter, X, Sparkles, MapPin, Users } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import CreateJobModal from '@/components/jobs/CreateJobModal';
import ApplyJobModal from '@/components/jobs/ApplyJobModal';

const JobsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const dispatch = useDispatch();
  const { jobs, nextCursor, hasMore, loading, loadingMore, error, filters } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobsThunk({ ...filters, append: false }));
  }, [dispatch, filters]);

  const handleTypeFilter = (type) => {
    dispatch(setJobFilters({ type }));
  };

  const handleLocationFilter = (locationType) => {
    dispatch(setJobFilters({ locationType }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setJobFilters({ search: searchInput }));
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && nextCursor) {
      dispatch(fetchJobsThunk({ ...filters, cursor: nextCursor, append: true }));
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 font-inter space-y-8 animate-fade-bg-in">
      {/* Header Banner */}
      <div className="dub-card-paper p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border">
        <div className="space-y-1">
          <span className="dub-pill text-[11px] py-0.5 px-2.5">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Verified Opportunities Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-satoshi font-semibold text-foreground tracking-tight">
            Jobs, Gigs & Open Collaborations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Discover high-impact engineering roles, contract bounties, or team up with verified developers on open-source and SaaS grid ventures.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="dub-btn-primary text-xs py-2.5 px-4 shrink-0 shadow-subtle flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#dcfce7]" />
          <span>Post Opportunity</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="dub-card p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search roles, companies, required tech stack keywords..."
              className="dub-input !pl-10 text-xs sm:text-sm py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="dub-btn-primary text-xs py-2 px-5">
              Search
            </button>
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  dispatch(setJobFilters({ search: '' }));
                }}
                className="dub-btn-outline text-xs py-2 px-3 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Type & Location Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Type:</span>
            {['all', 'full-time', 'contract', 'collab'].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeFilter(t)}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium capitalize transition-all border ${
                  filters.type === t
                    ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                    : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {t === 'collab' ? 'Open Collab' : t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold mr-1">Location:</span>
            {['all', 'remote', 'hybrid'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocationFilter(loc)}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium capitalize transition-all border ${
                  filters.locationType === loc
                    ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                    : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="dub-card p-6 h-64 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-[8px] bg-secondary"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-secondary rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 bg-secondary rounded w-full mt-4"></div>
              </div>
              <div className="h-8 bg-secondary rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="dub-card p-8 text-center bg-red-500/10 border border-red-500/20 text-red-500 text-sm space-y-3">
          <p>{error}</p>
          <button
            onClick={() => dispatch(fetchJobsThunk(filters))}
            className="dub-btn-outline text-xs"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="dub-card p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <Briefcase className="w-6 h-6 text-[#2563eb]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-satoshi font-semibold text-lg text-foreground">No Listings Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {filters.search || filters.type !== 'all' || filters.locationType !== 'all'
                ? 'Try adjusting your filters or search keywords to see more open roles and projects.'
                : 'Be the first to post a role or collaboration opportunity for the developer community!'}
            </p>
          </div>
          {(filters.search || filters.type !== 'all' || filters.locationType !== 'all') ? (
            <button
              onClick={() => dispatch(resetJobFilters())}
              className="dub-btn-outline text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="dub-btn-primary text-xs py-2 px-4"
            >
              Post First Listing
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onApplyClick={(j) => setApplyJob(j)} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4 pb-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="dub-btn-outline text-xs px-6 py-2"
              >
                {loadingMore ? 'Loading more listings...' : 'Load More Listings'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateJobModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ApplyJobModal isOpen={!!applyJob} onClose={() => setApplyJob(null)} job={applyJob} />
    </div>
  );
};

export default JobsPage;
