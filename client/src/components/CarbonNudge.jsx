import React from 'react';
import { Lightbulb, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCO2 } from '../utils/formatters';

const CarbonNudge = ({ totalCO2, weeklyTarget, remaining, categoryBreakdown }) => {
  const overAmount = formatCO2(Math.abs(remaining));

  // Determine highest emission contributor for contextual practical suggestions
  let highestCategory = 'travel';
  let highestCO2 = 0;
  if (categoryBreakdown) {
    Object.entries(categoryBreakdown).forEach(([key, val]) => {
      const co2Val = typeof val === 'number' ? val : (val?.co2 || 0);
      if (co2Val > highestCO2) {
        highestCO2 = co2Val;
        highestCategory = key;
      }
    });
  }

  const suggestions = {
    travel: 'Consider combining multiple short errands into one trip or opting for public transit/carpooling for your next commute.',
    bus: 'You are already utilizing shared public transit! Keeping trips optimized will help trim your footprint further.',
    flight: 'Aviation accounts for substantial emissions. For shorter regional distances, consider high-speed rail where feasible.',
    electricity: 'Switching off standby electronics, using LED bulbs, and adjusting climate control by 1°C can quickly lower weekly kWh.',
    veg_meal: 'Plant-based meals are already highly carbon-efficient! Sourcing locally grown seasonal produce enhances impact even more.',
    nonveg_meal: 'Swapping even 1 or 2 meat-based meals this week for hearty vegetarian alternatives can save 3–4 kg of CO₂.'
  };

  const currentSuggestion = suggestions[highestCategory] || suggestions.travel;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm transition-all">
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Weekly Target Exceeded
            </span>
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-gray-900">
            You've recorded {formatCO2(totalCO2)} kg CO₂ against your {formatCO2(weeklyTarget)} kg target
          </h3>

          <p className="mt-1 text-sm text-gray-700 leading-relaxed">
            You are currently <span className="font-semibold text-amber-900">{overAmount} kg</span> above your weekly carbon target. Target adjustments and small daily habits help restore balance over time.
          </p>

          {/* Constructive, encouraging suggestion */}
          <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200/60 text-xs text-gray-800 flex items-start space-x-2">
            <span className="font-semibold text-amber-900 flex-shrink-0">Practical tip:</span>
            <span>{currentSuggestion}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/log"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Another Activity</span>
            </Link>
            <span className="text-xs text-gray-500">
              Logging remains completely open — keeping track is key to progress!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonNudge;
