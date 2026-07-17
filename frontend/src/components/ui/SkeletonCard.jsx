import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/80 dark:bg-muted/40 ${className || ''}`}
      {...props}
    />
  );
};

export const SkeletonCard = ({ count = 1, className = '', showAvatar = true, lines = 3, showCode = false }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-sm space-y-4"
        >
          {showAvatar && (
            <div className="flex items-center space-x-3.5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-3 w-1/6 rounded" />
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-11/12 rounded" />
            {lines >= 3 && <Skeleton className="h-4 w-3/4 rounded" />}
          </div>

          {showCode && (
            <div className="space-y-2 pt-2">
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex space-x-4">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-14 rounded" />
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
