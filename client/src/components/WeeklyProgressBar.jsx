import React from 'react';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCO2 } from '../utils/formatters';

const WeeklyProgressBar = ({ totalCO2, weeklyTarget, percentage, remaining, targetExceeded, weekRange }) => {
  const clampedWidth = Math.min(percentage, 100);

  return (
    <div className="card-base p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-forest-700" />
            <h2 className="text-lg font-bold text-gray-900">Weekly Target Progress</h2>
          </div>
          {weekRange && (
            <p className="text-xs text-gray-500 mt-0.5">
              Cycle: Monday – Sunday ({weekRange})
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {targetExceeded ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Exceeded ({percentage}%)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-50 text-forest-800 border border-forest-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              <span>On Track ({percentage}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Numerical comparison */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatCO2(totalCO2)}{' '}
          <span className="text-sm font-normal text-gray-500">
            / {formatCO2(weeklyTarget)} kg CO₂
          </span>
        </div>
        <div className="text-sm font-semibold">
          {targetExceeded ? (
            <span className="text-amber-700">
              +{formatCO2(Math.abs(remaining))} kg over target
            </span>
          ) : (
            <span className="text-forest-700">
              {formatCO2(remaining)} kg remaining
            </span>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Weekly carbon budget progress"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            targetExceeded
              ? 'bg-amber-500'
              : percentage >= 85
              ? 'bg-emerald-600'
              : 'bg-forest-600'
          }`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>

      {/* Footer explanation */}
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>0 kg</span>
        <span>Goal: {formatCO2(weeklyTarget)} kg</span>
      </div>
    </div>
  );
};

export default WeeklyProgressBar;
