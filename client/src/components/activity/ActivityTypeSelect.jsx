import React from 'react';
import { ACTIVITY_TYPES } from '../../utils/carbonFactors';
import { Car, Bus, Plane, Zap, Salad, Beef } from 'lucide-react';

const iconMap = {
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Beef
};

const ActivityTypeSelect = ({ value, onChange, disabled, error }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="activity-type-select" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          1. Select Activity Type <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-gray-400 font-medium">6 core categories</span>
      </div>

      {/* Accessible native select (kept for accessibility and screen readers) */}
      <div className="relative md:hidden mb-2">
        <select
          id="activity-type-select"
          name="activityType"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'activity-type-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold bg-white text-gray-900 transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
              : 'border-gray-300 focus:ring-forest-600/20 focus:border-forest-600'
          }`}
        >
          <option value="">Select an activity...</option>
          {ACTIVITY_TYPES.map((act) => (
            <option key={act.value} value={act.value}>
              {act.label} ({act.description})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Tactile Category Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Activity type selection options">
        {ACTIVITY_TYPES.map((act) => {
          const Icon = iconMap[act.icon] || Car;
          const isSelected = value === act.value;

          return (
            <button
              key={act.value}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onChange(act.value)}
              className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'border-forest-700 bg-forest-50/90 text-forest-950 font-bold shadow-xs ring-2 ring-forest-700/20 scale-[1.01]'
                  : 'border-gray-200/90 bg-white text-gray-700 hover:bg-forest-50/40 hover:border-forest-200'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-forest-800 text-white shadow-xs' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block leading-snug truncate">{act.label}</span>
                <span className="text-[10px] text-gray-500 block font-medium mt-0.5">unit: {act.unit}</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p id="activity-type-error" className="mt-1.5 text-xs text-rose-600 font-bold flex items-center space-x-1" role="alert">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default ActivityTypeSelect;
