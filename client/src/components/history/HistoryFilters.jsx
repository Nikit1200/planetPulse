import React, { useState } from 'react';
import { RotateCcw, Search, Filter } from 'lucide-react';
import { ACTIVITY_TYPES } from '../../utils/carbonFactors';
import { formatDateSafe } from '../../utils/formatters';

const HistoryFilters = ({
  appliedFilters,
  onApplyFilters,
  onClearFilters,
  isLoading
}) => {
  // Local form state - user can change inputs without immediate API triggers
  const [selectedType, setSelectedType] = useState(appliedFilters.type || 'all');
  const [fromDate, setFromDate] = useState(appliedFilters.from || '');
  const [toDate, setToDate] = useState(appliedFilters.to || '');
  const [dateError, setDateError] = useState(null);

  // Sync local inputs if external appliedFilters change (e.g. on Clear)
  React.useEffect(() => {
    setSelectedType(appliedFilters.type || 'all');
    setFromDate(appliedFilters.from || '');
    setToDate(appliedFilters.to || '');
    setDateError(null);
  }, [appliedFilters.type, appliedFilters.from, appliedFilters.to]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setDateError(null);

    // Validate date range
    if (fromDate && toDate && fromDate > toDate) {
      setDateError('From date cannot be after the To date.');
      return;
    }

    onApplyFilters({
      type: selectedType,
      from: fromDate,
      to: toDate
    });
  };

  const handleClear = () => {
    setSelectedType('all');
    setFromDate('');
    setToDate('');
    setDateError(null);
    onClearFilters();
  };

  const hasActiveFilters =
    (appliedFilters.type && appliedFilters.type !== 'all') ||
    Boolean(appliedFilters.from) ||
    Boolean(appliedFilters.to);

  // Active filter chip labels
  const getActiveTypeLabel = () => {
    const found = ACTIVITY_TYPES.find((t) => t.value === appliedFilters.type);
    return found ? found.label : appliedFilters.type;
  };

  return (
    <div className="card-base p-5 bg-white rounded-2xl border border-gray-200/80 shadow-card space-y-4 animate-slide-up">
      <div className="flex items-center space-x-2 text-forest-900 border-b border-gray-100 pb-3">
        <Filter className="w-4 h-4 text-forest-700" />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Filter Activities
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          {/* 1. Activity Type Selector */}
          <div className="sm:col-span-4">
            <label
              htmlFor="history-filter-type"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Activity Type
            </label>
            <div className="relative">
              <select
                id="history-filter-type"
                name="activityType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600/20 focus:border-forest-600 appearance-none cursor-pointer"
              >
                <option value="all">All Activities</option>
                {ACTIVITY_TYPES.map((act) => (
                  <option key={act.value} value={act.value}>
                    {act.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. From Date */}
          <div className="sm:col-span-3">
            <label
              htmlFor="history-filter-from"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              From Date
            </label>
            <input
              type="date"
              id="history-filter-from"
              name="fromDate"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                if (dateError) setDateError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? 'date-range-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600/20 focus:border-forest-600"
            />
          </div>

          {/* 3. To Date */}
          <div className="sm:col-span-3">
            <label
              htmlFor="history-filter-to"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              To Date
            </label>
            <input
              type="date"
              id="history-filter-to"
              name="toDate"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                if (dateError) setDateError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? 'date-range-error' : undefined}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600/20 focus:border-forest-600"
            />
          </div>

          {/* 4. Action Buttons */}
          <div className="sm:col-span-2 flex items-center space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-forest-800 hover:bg-forest-900 active:scale-98 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || (!hasActiveFilters && !fromDate && !toDate && selectedType === 'all')}
              className="inline-flex items-center justify-center p-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-40 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date Validation Error Message */}
        {dateError && (
          <p
            id="date-range-error"
            className="mt-2.5 text-xs text-rose-600 font-bold flex items-center space-x-1"
            role="alert"
          >
            <span>{dateError}</span>
          </p>
        )}
      </form>

      {/* Active Filter Chips Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-medium">Active filters:</span>

          {appliedFilters.type && appliedFilters.type !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 text-forest-950 font-bold">
              <span>Type: {getActiveTypeLabel()}</span>
            </span>
          )}

          {appliedFilters.from && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 text-forest-950 font-medium">
              <span>From: {formatDateSafe(appliedFilters.from)}</span>
            </span>
          )}

          {appliedFilters.to && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 text-forest-950 font-medium">
              <span>To: {formatDateSafe(appliedFilters.to)}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;
