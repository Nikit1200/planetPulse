import React from 'react';

const HistorySkeleton = () => {
  return (
    <div className="card-base p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-pulse" aria-busy="true" aria-label="Loading activity history">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-100 rounded" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySkeleton;
