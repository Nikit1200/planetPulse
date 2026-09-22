import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { formatWeekRange } from '../../utils/formatters';

const DashboardHeader = ({ week, onRefresh, isRefreshing }) => {
  const formattedWeek = week ? formatWeekRange(week.start, week.end) : '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-100/80 px-2.5 py-0.5 rounded-full border border-forest-200/80 inline-flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-forest-700" />
            <span>Weekly Carbon Overview</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
          Your Carbon Footprint
        </h1>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 font-medium">
          <Calendar className="w-4 h-4 text-forest-700 flex-shrink-0" />
          <span>Active Week:</span>
          <span className="text-forest-950 font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200/60 shadow-2xs">
            {formattedWeek}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 self-start sm:self-center">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-forest-950 hover:bg-forest-50/60 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            title="Refresh dashboard data"
            aria-label="Refresh dashboard data"
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

export default DashboardHeader;
