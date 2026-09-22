import React from 'react';
import { Car, Bus, Plane, Zap, Salad, Beef } from 'lucide-react';
import { formatCO2 } from '../../utils/formatters';

const CATEGORY_META = [
  { key: 'travel', label: 'Travel', icon: Car, color: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-700' },
  { key: 'bus', label: 'Bus', icon: Bus, color: 'bg-teal-600', iconBg: 'bg-teal-50 text-teal-700' },
  { key: 'flight', label: 'Flight', icon: Plane, color: 'bg-sky-600', iconBg: 'bg-sky-50 text-sky-700' },
  { key: 'electricity', label: 'Electricity', icon: Zap, color: 'bg-amber-500', iconBg: 'bg-amber-50 text-amber-700' },
  { key: 'veg_meal', label: 'Veg Meal', icon: Salad, color: 'bg-lime-600', iconBg: 'bg-lime-50 text-lime-700' },
  { key: 'nonveg_meal', label: 'Non-Veg Meal', icon: Beef, color: 'bg-rose-600', iconBg: 'bg-rose-50 text-rose-700' }
];

const CategoryBreakdown = ({ categoryBreakdown, totalCO2 = 0 }) => {
  // Normalize categoryBreakdown whether it's an object or array
  const rawMap = {};
  if (categoryBreakdown) {
    if (Array.isArray(categoryBreakdown)) {
      categoryBreakdown.forEach((item) => {
        rawMap[item.type] = typeof item.co2 === 'number' ? item.co2 : 0;
      });
    } else if (typeof categoryBreakdown === 'object') {
      Object.entries(categoryBreakdown).forEach(([k, v]) => {
        rawMap[k] = typeof v === 'number' ? v : (v?.co2 || 0);
      });
    }
  }

  // Ensure all 6 categories are represented even if 0 kg CO2
  const categories = CATEGORY_META.map((cat) => {
    const value = rawMap[cat.key] || 0;
    const sharePercentage = totalCO2 > 0 ? Math.round((value / totalCO2) * 100) : 0;
    return {
      ...cat,
      value,
      sharePercentage
    };
  });

  // Calculate highest value for relative bar widths
  const maxVal = Math.max(...categories.map((c) => c.value), 1);

  return (
    <div className="card-base p-6 bg-white rounded-2xl border border-gray-200/80 shadow-card flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Emissions by Category
            </h3>
            <p className="text-xs text-gray-500">
              Distribution across monitored activities
            </p>
          </div>
          <span className="text-xs font-bold text-forest-800 bg-forest-50 border border-forest-200/60 px-2.5 py-1 rounded-full">
            All 6 Active
          </span>
        </div>

        {/* Horizontal Bar Breakdown Rows */}
        <div className="space-y-3.5" role="list" aria-label="Carbon emission breakdown by category">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const barWidthPercent = cat.value > 0 ? Math.max(3, Math.min(100, (cat.value / maxVal) * 100)) : 0;

            return (
              <div key={cat.key} className="space-y-1.5" role="listitem">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${cat.iconBg} border border-black/5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-gray-800">{cat.label}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {cat.sharePercentage > 0 && (
                      <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                        {cat.sharePercentage}%
                      </span>
                    )}
                    <span className="font-black text-gray-900 font-sans">
                      {formatCO2(cat.value)}{' '}
                      <span className="text-[11px] font-semibold text-gray-500">kg CO₂</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${cat.color}`}
                    style={{ width: `${barWidthPercent}%` }}
                    role="presentation"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>6 categories tracked</span>
        <span className="font-bold text-forest-950">
          Weekly Total: {formatCO2(totalCO2)} kg CO₂
        </span>
      </div>
    </div>
  );
};

export default CategoryBreakdown;
