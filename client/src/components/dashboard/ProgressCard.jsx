import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Edit3 } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';

const ProgressCard = ({ totalCO2, weeklyTarget, percentage, remaining, exceededBy, targetExceeded, onEditTarget }) => {
  // Clamp visual bar width between 0 and 100 to avoid overflow
  const visualWidth = Math.max(0, Math.min(percentage, 100));

  return (
    <div className="card-base p-6 sm:p-7 bg-white rounded-2xl border border-gray-200/80 shadow-card space-y-4 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-forest-50 text-forest-800 border border-forest-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Weekly Carbon Budget Progress
            </h2>
            <p className="text-xs text-gray-500">
              Track your cumulative impact against the active weekly goal
            </p>
          </div>
        </div>

        {/* Factual Target Status Badge & Quick Edit Button */}
        <div className="flex items-center space-x-2">
          {onEditTarget && (
            <button
              type="button"
              onClick={onEditTarget}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 active:scale-95 transition-all cursor-pointer"
              title="Change weekly target"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Adjust Target</span>
            </button>
          )}

          {targetExceeded ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Target Exceeded ({percentage}%)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-forest-50 text-forest-900 border border-forest-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
              <span>Within Target ({percentage}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Numerical Comparison */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
        <div className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight font-sans">
          {formatCO2(totalCO2)}{' '}
          <span className="text-sm font-semibold text-gray-400">
            / {formatCO2(weeklyTarget)} kg CO₂
          </span>
        </div>

        <div className="text-xs sm:text-sm font-bold">
          {targetExceeded ? (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              +{formatCO2(exceededBy)} kg CO₂ exceeded
            </span>
          ) : (
            <span className="text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
              {formatCO2(remaining)} kg CO₂ remaining
            </span>
          )}
        </div>
      </div>

      {/* Modern Gradient Progress Track */}
      <div className="space-y-2">
        <div
          className="w-full bg-gray-100 rounded-full h-4 overflow-hidden p-0.5 border border-gray-200/60"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Weekly carbon budget progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              targetExceeded
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : percentage >= 85
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-forest-600 to-forest-700'
            }`}
            style={{ width: `${visualWidth}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium px-0.5">
          <span>0.00 kg</span>
          <span className="font-extrabold text-forest-950">{percentage}% utilized</span>
          <span>Target: {formatCO2(weeklyTarget)} kg</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
