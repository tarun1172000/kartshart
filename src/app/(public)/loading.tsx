"use client";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 max-w-2xl mx-auto"></div>
      <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-md mb-12 max-w-md mx-auto"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10121a]">
            <div className="h-48 sm:h-52 w-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 w-1/4 rounded"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 w-3/4 rounded"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 w-1/2 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 w-full rounded mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
