import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, RotateCcw, Sprout } from 'lucide-react';

const HistoryEmptyState = ({ hasActiveFilters, onClearFilters }) => {
  if (hasActiveFilters) {
    return (
      <div className="card-base p-10 sm:p-12 bg-white rounded-2xl border border-gray-200/80 shadow-card text-center max-w-md mx-auto space-y-4 animate-slide-up">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
          <Search className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900">
            No activities match your filters
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Try adjusting your date range or selecting a different activity type to view records.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-10 sm:p-12 bg-white rounded-2xl border border-gray-200/80 shadow-card text-center max-w-md mx-auto space-y-4 animate-slide-up">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-forest-50 border border-forest-200/80 text-forest-800 flex items-center justify-center shadow-xs">
        <Sprout className="w-7 h-7 text-forest-700" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900">
          No activities logged yet
        </h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Start recording everyday emissions to populate your history log.
        </p>
      </div>
      <div className="pt-2">
        <Link
          to="/log"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-mint-300" />
          <span>Log First Activity</span>
        </Link>
      </div>
    </div>
  );
};

export default HistoryEmptyState;
