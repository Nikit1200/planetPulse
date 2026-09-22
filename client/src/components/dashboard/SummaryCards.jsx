import React from 'react';
import { Flame, Target, Percent, ListTodo, Edit3 } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';

const SummaryCards = ({ totalCO2, weeklyTarget, percentage, remaining, exceededBy, targetExceeded, activityCount, onEditTarget }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total CO2 Card (Hero Card) */}
      <div
        className="card-base p-5 bg-white rounded-2xl border border-gray-200/80 shadow-card hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 group animate-slide-up"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Total CO₂
            </p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl sm:text-4xl font-black text-forest-950 tracking-tight font-sans">
                {formatCO2(totalCO2)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-forest-700">kg CO₂</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${
            targetExceeded
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-forest-50 text-forest-800 border-forest-200/60'
          }`}>
            <Flame className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Monday–Sunday</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            targetExceeded
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-forest-50 text-forest-800 border-forest-200'
          }`}>
            {targetExceeded ? 'Above Target' : 'Within Target'}
          </span>
        </div>
      </div>

      {/* 2. Weekly Target Card */}
      <div
        className="card-base p-5 bg-white rounded-2xl border border-gray-200/80 shadow-card hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 group animate-slide-up"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Weekly Target
            </p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-sans">
                {formatCO2(weeklyTarget)}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">kg CO₂</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 transition-transform duration-200 group-hover:scale-105">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Budget limit</span>
          {onEditTarget && (
            <button
              type="button"
              onClick={onEditTarget}
              className="inline-flex items-center space-x-1 text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline cursor-pointer focus:outline-none"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Target Progress Card */}
      <div
        className="card-base p-5 bg-white rounded-2xl border border-gray-200/80 shadow-card hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 group animate-slide-up"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Target Progress
            </p>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight font-sans ${
                targetExceeded ? 'text-amber-700' : 'text-forest-950'
              }`}>
                {percentage}%
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 ${
            targetExceeded
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 font-medium truncate max-w-[120px]">
            {targetExceeded
              ? `+${formatCO2(exceededBy)} kg over`
              : `${formatCO2(remaining)} kg left`}
          </p>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            targetExceeded
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {targetExceeded ? 'Exceeded' : 'On Track'}
          </span>
        </div>
      </div>

      {/* 4. Activities Logged Card */}
      <div
        className="card-base p-5 bg-white rounded-2xl border border-gray-200/80 shadow-card hover:border-forest-200 hover:shadow-card-hover transition-all duration-200 group animate-slide-up"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Activities Logged
            </p>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-sans">
                {activityCount}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">entries</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-forest-50 text-forest-800 border border-forest-200/60 transition-transform duration-200 group-hover:scale-105">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Current cycle</span>
          <span className="text-[11px] font-bold text-forest-800 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
