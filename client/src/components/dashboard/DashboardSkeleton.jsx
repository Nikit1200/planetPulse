import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 pb-12 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200 rounded-lg" />
          <div className="h-4 w-72 bg-gray-100 rounded-md" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Summary Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-7 w-28 bg-gray-200 rounded-md" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Weekly Progress Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-gray-200 rounded" />
          <div className="h-6 w-28 bg-gray-100 rounded-full" />
        </div>
        <div className="flex justify-between items-baseline">
          <div className="h-8 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-3.5 w-full bg-gray-100 rounded-full" />
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-60 w-full bg-gray-50 rounded-xl flex items-end justify-between p-4 space-x-2">
            {[40, 70, 25, 90, 50, 30, 60].map((h, idx) => (
              <div key={idx} className="w-8 bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="h-5 w-44 bg-gray-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gray-100 rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="flex-1 h-3 bg-gray-100 rounded-full" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
        <div className="h-5 w-36 bg-gray-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 bg-gray-100 rounded-xl" />
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
