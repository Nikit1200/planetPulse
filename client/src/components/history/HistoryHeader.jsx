import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw, History as HistoryIcon } from 'lucide-react';

const HistoryHeader = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100/80 px-2.5 py-0.5 rounded-full border border-forest-200/80 inline-flex items-center space-x-1">
            <HistoryIcon className="w-3 h-3 text-forest-700" />
            <span>Complete Log</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
          Activity History
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Review and filter all recorded carbon footprint activities across all weeks
        </p>
      </div>

      <div className="flex items-center space-x-2.5 self-start sm:self-center">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-forest-950 hover:bg-forest-50/60 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            title="Refresh history records"
            aria-label="Refresh history records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-forest-700' : ''}`} />
          </button>
        )}

        <Link
          to="/log"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-mint-300" />
          <span>+ Log Activity</span>
        </Link>
      </div>
    </div>
  );
};

export default HistoryHeader;
