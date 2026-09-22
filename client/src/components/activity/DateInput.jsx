import React from 'react';

const DateInput = ({ value, onChange, disabled, error }) => {
  return (
    <div>
      <label htmlFor="activity-date-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
        3. Date <span className="text-rose-500">*</span>
      </label>

      <div className="relative rounded-xl shadow-xs">
        <input
          type="date"
          id="activity-date-input"
          name="activityDate"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'date-error' : 'date-hint'}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
              : 'border-gray-300 focus:ring-forest-600/20 focus:border-forest-600'
          }`}
        />
      </div>

      {error ? (
        <p id="date-error" className="mt-1.5 text-xs text-rose-600 font-bold" role="alert">
          {error}
        </p>
      ) : (
        <p id="date-hint" className="mt-1 text-[11px] text-gray-500 font-medium">
          Calendar date in local timezone
        </p>
      )}
    </div>
  );
};

export default DateInput;
