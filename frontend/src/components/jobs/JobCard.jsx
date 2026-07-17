import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const JobCard = ({ job, onApplyClick }) => {
  if (!job) return null;

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'collab':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'contract':
      case 'freelance':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'internship':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const formatBudget = (budget) => {
    if (!budget || (!budget.min && !budget.max)) return 'Negotiable';
    const currency = budget.currency || '$';
    if (budget.min && budget.max) {
      return `${currency}${budget.min.toLocaleString()} - ${currency}${budget.max.toLocaleString()} / ${budget.period || 'yr'}`;
    }
    return `${currency}${(budget.min || budget.max).toLocaleString()} / ${budget.period || 'yr'}`;
  };

  return (
    <Card className="border border-border/80 hover:border-primary/50 transition-all duration-200 bg-card/70 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start space-x-3.5">
            <Avatar className="w-11 h-11 border border-border rounded-lg">
              <AvatarImage src={job.companyLogo || job.postedBy?.profilePicture} alt={job.company} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                {job.company?.[0]?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/jobs/${job._id}`} className="font-semibold text-base hover:text-primary transition-colors block text-foreground leading-snug">
                {job.title}
              </Link>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{job.company}</p>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border uppercase tracking-wider ${getBadgeStyle(job.type)}`}>
            {job.type}
          </span>
        </CardHeader>

        <CardContent className="px-5 py-2 space-y-3.5">
          <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
              <span className="capitalize">{job.locationType}</span> {job.location ? `• ${job.location}` : ''}
            </span>
            <span className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              {formatBudget(job.budget)}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Recently'}
            </span>
          </div>

          <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed">
            {job.description}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {job.skills.slice(0, 5).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 text-[10px] rounded bg-muted/60 text-muted-foreground font-mono">
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted/40 text-muted-foreground">
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="px-5 py-3.5 border-t border-border/50 flex items-center justify-between bg-muted/20">
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
          <Users className="w-4 h-4" />
          <span>{job.applicationsCount || 0} {job.applicationsCount === 1 ? 'applicant' : 'applicants'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`/jobs/${job._id}`}>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Details
            </Button>
          </Link>
          {job.hasApplied ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Applied
            </span>
          ) : (
            <Button
              size="sm"
              onClick={() => onApplyClick(job)}
              className="h-8 text-xs font-medium px-3"
            >
              Apply
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
