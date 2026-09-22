import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';
import { getActivityConfig } from '../../utils/carbonFactors';

const ActivitySuccess = ({ activity, onDismiss }) => {
  if (!activity) return null;

  const config = getActivityConfig(activity.type);
  const displayLabel = config ? config.label : activity.type;

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-forest-950 text-white shadow-card border border-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 bg-mint-500/20 text-mint-400 rounded-xl flex-shrink-0 mt-0.5 border border-mint-500/30">
          <CheckCircle2 className="w-5 h-5 text-mint-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white flex items-center space-x-1.5">
            <span>Activity logged successfully</span>
          </h4>
          <div className="text-xs text-gray-300">
            <span className="font-bold text-mint-200">{displayLabel}</span>
            <span className="mx-2 text-gray-500">•</span>
            <span>{activity.quantity} {activity.unit}</span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-black text-white font-sans">
              +{formatCO2(activity.co2)} <span className="text-xs font-semibold text-mint-400">kg CO₂</span>
            </span>
            <span className="text-xs text-gray-400 ml-2">added to this week's footprint</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 self-end sm:self-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-1 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
        >
          <span>View Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss success notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivitySuccess;
