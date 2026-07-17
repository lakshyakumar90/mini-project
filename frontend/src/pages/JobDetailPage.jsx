import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobByIdThunk, updateApplicationStatusThunk, deleteJobThunk, clearCurrentJob } from '@/store/slices/jobSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2, ArrowLeft, Trash2, Users, Send, ExternalLink, FileText, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ApplyJobModal from '@/components/jobs/ApplyJobModal';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const { currentJob: job, loading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchJobByIdThunk(id));
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, id]);

  const handleDeleteJob = async () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      await dispatch(deleteJobThunk(job._id));
      navigate('/jobs');
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    await dispatch(updateApplicationStatusThunk({ jobId: job._id, applicationId, status }));
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-10 px-4 space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
        <Card className="p-8 space-y-4 animate-pulse">
          <div className="h-12 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-40 bg-muted rounded w-full mt-6"></div>
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Listing Not Found</h2>
        <p className="text-sm text-muted-foreground">{error || 'This job or collaboration opportunity may have been deleted or closed.'}</p>
        <Link to="/jobs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const formatBudget = (budget) => {
    if (!budget || (!budget.min && !budget.max)) return 'Negotiable';
    const currency = budget.currency || '$';
    if (budget.min && budget.max) {
      return `${currency}${budget.min.toLocaleString()} - ${currency}${budget.max.toLocaleString()} / ${budget.period || 'yr'}`;
    }
    return `${currency}${(budget.min || budget.max).toLocaleString()} / ${budget.period || 'yr'}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Accepted</span>;
      case 'reviewed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">Reviewed</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-500 border border-red-500/20">Declined</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link to="/jobs" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all listings
        </Link>
        {job.isOwner && (
          <Button variant="destructive" size="sm" onClick={handleDeleteJob} className="h-8 text-xs">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Listing
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-border/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-14 h-14 border border-border rounded-xl">
                    <AvatarImage src={job.companyLogo || job.postedBy?.profilePicture} alt={job.company} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xl">
                      {job.company?.[0]?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{job.title}</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{job.company}</p>
                  </div>
                </div>
                <span className="self-start md:self-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wide border border-primary/20">
                  {job.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-6 pt-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                  <span className="capitalize">{job.locationType}</span> {job.location ? `(${job.location})` : ''}
                </span>
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1.5 text-emerald-500" />
                  {formatBudget(job.budget)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'recently'}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1.5" />
                  {job.applicationsCount || 0} applications
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Role Description</h3>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-semibold text-sm text-foreground">Key Requirements & Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 mr-2.5 text-primary shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h3 className="font-semibold text-sm text-foreground pt-2">Tech Stack & Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applicant Management Dashboard (Visible ONLY to Owner) */}
          {job.isOwner && (
            <Card className="border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-base">Applicant Dashboard ({job.applications?.length || 0})</h3>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {!job.applications || job.applications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    No applications received yet. Check back soon or share your listing link across the community!
                  </div>
                ) : (
                  job.applications.map((app) => (
                    <div key={app._id} className="border border-border/60 rounded-xl p-4 bg-background/50 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <Link to={`/user/${app.applicant?._id}`}>
                            <Avatar className="w-10 h-10 border border-border">
                              <AvatarImage src={app.applicant?.profilePicture} alt={app.applicant?.name} />
                              <AvatarFallback>{app.applicant?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link to={`/user/${app.applicant?._id}`} className="font-medium text-sm hover:underline flex items-center text-foreground">
                              {app.applicant?.name} <ExternalLink className="w-3 h-3 ml-1 text-muted-foreground" />
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {app.applicant?.role || 'Developer'} {app.applicant?.location ? `• ${app.applicant.location}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusBadge(app.status)}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            className="bg-background border border-input rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                          >
                            <option value="pending">Mark Pending</option>
                            <option value="reviewed">Mark Reviewed</option>
                            <option value="accepted">Accept / Contact</option>
                            <option value="rejected">Decline</option>
                          </select>
                        </div>
                      </div>

                      {app.coverNote && (
                        <div className="bg-muted/30 p-3 rounded-lg text-xs text-foreground/90 border border-border/40">
                          <span className="font-semibold block text-muted-foreground text-[10px] uppercase mb-1">Cover Note:</span>
                          <p className="whitespace-pre-wrap">{app.coverNote}</p>
                        </div>
                      )}

                      {app.resume && app.resume.url && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-muted-foreground mr-1 uppercase font-semibold">Resume:</span>
                          <a
                            href={app.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-primary/10 text-primary border border-primary/20 text-xs hover:bg-primary/20 transition-colors font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[180px] sm:max-w-[240px]">{app.resume.originalName || app.resume.filename || 'View Resume'}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        </div>
                      )}

                      {app.additionalDocuments && app.additionalDocuments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Additional Documents:</span>
                          <div className="flex flex-wrap gap-2">
                            {app.additionalDocuments.map((doc, dIdx) => (
                              doc.url ? (
                                <a
                                  key={dIdx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-secondary text-foreground border border-border text-xs hover:bg-secondary/80 transition-colors font-medium"
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="truncate max-w-[160px]">{doc.originalName || doc.filename || `Document ${dIdx + 1}`}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}

                      {app.applicant?.skills && app.applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center pt-1">
                          <span className="text-[10px] text-muted-foreground mr-1">Skills:</span>
                          {app.applicant.skills.slice(0, 6).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-mono">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <Link to={`/chat?userId=${app.applicant._id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs space-x-1.5">
                            <Send className="w-3 h-3 text-primary" />
                            <span>Message Applicant</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Poster Profile & Apply Action */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-border/80 bg-card/80 p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b border-border/60 pb-2">Listing Posted By</h3>
            {job.postedBy ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Link to={`/user/${job.postedBy._id}`}>
                    <Avatar className="w-12 h-12 border border-border">
                      <AvatarImage src={job.postedBy.profilePicture} alt={job.postedBy.name} />
                      <AvatarFallback>{job.postedBy.name?.[0] || 'D'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link to={`/user/${job.postedBy._id}`} className="font-medium text-sm hover:underline text-foreground block">
                      {job.postedBy.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{job.postedBy.role || 'Developer'}</p>
                  </div>
                </div>
                {job.postedBy.bio && <p className="text-xs text-muted-foreground line-clamp-3">{job.postedBy.bio}</p>}
                <Link to={`/user/${job.postedBy._id}`} className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Community Member</p>
            )}
          </Card>

          {/* Action Box */}
          {!job.isOwner && (
            <Card className="border border-border/80 bg-gradient-to-br from-card to-primary/5 p-5 space-y-3 text-center">
              <h3 className="font-semibold text-base">Interested in this role?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Submit your profile and optional cover note directly to {job.company}.
              </p>
              {job.hasApplied ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-medium text-xs flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have applied to this listing</span>
                </div>
              ) : (
                <Button onClick={() => setIsApplyOpen(true)} className="w-full font-medium shadow-md">
                  Apply Now
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      <ApplyJobModal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} job={job} />
    </div>
  );
};

export default JobDetailPage;
