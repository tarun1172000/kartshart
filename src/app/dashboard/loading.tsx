"use client";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#10121a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 w-48 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-64 rounded"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 w-32 rounded-xl"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-[#10121a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 rounded"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/4 rounded"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/4 rounded"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 w-12 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
