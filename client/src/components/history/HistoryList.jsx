import React from 'react';
import { Trash2, Car, Bus, Plane, Zap, Salad, Beef } from 'lucide-react';
import { getActivityConfig } from '../../utils/carbonFactors';
import { formatCO2, formatDateSafe, formatQuantity } from '../../utils/formatters';

const iconMap = {
  travel: Car,
  bus: Bus,
  flight: Plane,
  electricity: Zap,
  veg_meal: Salad,
  nonveg_meal: Beef
};

const HistoryList = ({ activities = [], onDeleteRequest }) => {
  const count = activities.length;
  const countText = `${count} ${count === 1 ? 'activity' : 'activities'}`;
  const totalCO2 = activities.reduce((sum, act) => sum + Number(act.co2 || 0), 0);

  return (
    <div className="card-base bg-white rounded-2xl border border-gray-200/80 shadow-card overflow-hidden animate-slide-up">
      {/* Header Results Summary */}
      <div className="px-6 py-4 bg-gray-50/75 border-b border-gray-100 flex items-center justify-between text-xs">
        <span className="font-bold text-gray-800">
          Showing <span className="text-forest-950 font-extrabold">{countText}</span>
        </span>
        <span className="font-semibold text-gray-600">
          Total Filtered CO₂: <span className="font-black text-forest-950 font-sans">{formatCO2(totalCO2)} kg</span>
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm" aria-label="Activity history table">
          <thead className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Date</th>
              <th scope="col" className="px-6 py-3.5">Activity</th>
              <th scope="col" className="px-6 py-3.5">Quantity</th>
              <th scope="col" className="px-6 py-3.5">CO₂ Emission</th>
              {onDeleteRequest && (
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {activities.map((act) => {
              const config = getActivityConfig(act.type);
              const Icon = iconMap[act.type] || Car;
              const displayLabel = config ? config.label : act.type;
              const key = act.id || act._id;

              return (
                <tr key={key} className="hover:bg-forest-50/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-semibold">
                    {formatDateSafe(act.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-forest-50 text-forest-800 border border-forest-200/60">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900">{displayLabel}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                    {formatQuantity(act.quantity, act.unit)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-black text-forest-950 font-sans">
                      {formatCO2(act.co2)}
                    </span>
                    <span className="text-xs font-bold text-forest-700 ml-1">kg CO₂</span>
                  </td>

                  {onDeleteRequest && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(act)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete activity"
                        aria-label={`Delete ${displayLabel} activity on ${formatDateSafe(act.date)}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="md:hidden divide-y divide-gray-100" role="list" aria-label="Activity history list">
        {activities.map((act) => {
          const config = getActivityConfig(act.type);
          const Icon = iconMap[act.type] || Car;
          const displayLabel = config ? config.label : act.type;
          const key = act.id || act._id;

          return (
            <div key={key} className="p-4 flex items-center justify-between" role="listitem">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-800 flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {displayLabel}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateSafe(act.date, { month: 'short', day: 'numeric', year: 'numeric' })} •{' '}
                    <span className="font-semibold text-gray-700">{formatQuantity(act.quantity, act.unit)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pl-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-black text-forest-950 font-sans">
                    {formatCO2(act.co2)}
                  </p>
                  <p className="text-[10px] font-bold text-forest-700">kg CO₂</p>
                </div>

                {onDeleteRequest && (
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(act)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                    aria-label={`Delete ${displayLabel}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
