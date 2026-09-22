import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const HistoryError = ({ message, onRetry, isRetrying }) => {
  return (
    <div
      className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-xs text-center space-y-4"
      role="alert"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900">
          Unable to load activity history
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {message || 'Please try again.'}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryError;
