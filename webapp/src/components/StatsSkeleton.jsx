import React from 'react';

const StatsSkeleton = () => {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-center h-full p-4">
      <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/20 dark:border-white/10">
        {/* Trophy Skeleton */}
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 animate-pulse flex items-center justify-center" />

        {/* Text Skeleton */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="h-6 w-48 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Chart Skeleton */}
        <div className="w-full h-48 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-4 flex flex-col justify-between animate-pulse">
          <div className="h-3 w-28 bg-black/5 dark:bg-white/5 rounded-md" />
          <div className="flex items-end justify-between h-32 gap-3 pt-4">
            {[40, 70, 30, 90, 60, 80, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-black/10 dark:bg-white/10 rounded-t-lg"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-2.5 w-6 bg-black/5 dark:bg-white/5 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatsSkeleton);
