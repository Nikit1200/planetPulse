import React from 'react';

const StatCard = ({ title, value, unit, subtitle, icon: Icon, badge, color = 'emerald' }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="card-base p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        )}
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
