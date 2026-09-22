import React from 'react';
import { Leaf, Calculator } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';

const Co2Preview = ({ config, quantity, estimatedCO2 }) => {
  const hasValidEstimate = estimatedCO2 !== null && estimatedCO2 !== undefined;

  return (
    <div className="rounded-2xl border border-forest-200/80 bg-gradient-to-br from-forest-50/80 via-emerald-50/40 to-white p-5 shadow-xs transition-all animate-slide-up">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-forest-100">
        <div className="flex items-center space-x-2 text-forest-900">
          <div className="p-1.5 rounded-lg bg-forest-100 text-forest-800">
            <Calculator className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-950">
            4. Estimated Carbon Impact
          </span>
        </div>

        <span className="text-xs text-forest-800 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-forest-200/60 shadow-2xs">
          Factor: {config.factor} kg CO₂ / {config.unit}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
        <div className="text-xs text-gray-600 font-medium">
          {hasValidEstimate ? (
            <span className="flex items-center space-x-1.5">
              <Leaf className="w-3.5 h-3.5 text-forest-600" />
              <span>
                {quantity} {config.unit} × {config.factor} kg CO₂
              </span>
            </span>
          ) : (
            <span className="text-gray-400">Enter a valid positive quantity to preview CO₂</span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-black text-forest-950 tracking-tight font-sans transition-all duration-200">
          {hasValidEstimate ? (
            <span className="inline-flex items-baseline space-x-1">
              <span>{formatCO2(estimatedCO2)}</span>
              <span className="text-sm font-bold text-forest-700">kg CO₂</span>
            </span>
          ) : (
            <span className="text-gray-300 font-normal">—</span>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 font-medium">
        * Estimated live preview. The backend authoritatively calculates and persists the final emission value.
      </p>
    </div>
  );
};

export default Co2Preview;
