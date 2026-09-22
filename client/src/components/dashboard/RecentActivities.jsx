import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, Car, Bus, Plane, Zap, Salad, Beef, Sprout } from 'lucide-react';
import { formatCO2, formatDateSafe, formatQuantity } from '../../utils/formatters';
import { getActivityConfig } from '../../utils/carbonFactors';

const iconMap = {
  travel: Car,
  bus: Bus,
  flight: Plane,
  electricity: Zap,
  veg_meal: Salad,
  nonveg_meal: Beef
};

const RecentActivities = ({ activities = [] }) => {
  // Empty State with eco illustration
  if (!activities || activities.length === 0) {
    return (
      <div className="card-base p-8 sm:p-10 bg-white rounded-2xl border border-gray-200/80 shadow-card text-center space-y-3.5 animate-slide-up">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-forest-50 border border-forest-200/80 text-forest-800 flex items-center justify-center shadow-xs">
          <Sprout className="w-7 h-7 text-forest-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900">
            No activities logged yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Start tracking your everyday carbon footprint by recording your first activity.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/log"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-mint-300" />
            <span>Log Your First Activity</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-6 bg-white rounded-2xl border border-gray-200/80 shadow-card space-y-4 animate-slide-up">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Recent Activities
          </h3>
          <p className="text-xs text-gray-500">
            Latest entries recorded in PlanetPulse
          </p>
        </div>

        <Link
          to="/log"
          className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center space-x-1 group"
        >
          <span>+ Add Activity</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100" role="feed" aria-label="Recent carbon activities">
        {activities.map((act) => {
          const config = getActivityConfig(act.type);
          const Icon = iconMap[act.type] || Car;
          const displayLabel = config ? config.label : act.type;
          const key = act.id || act._id || `${act.type}-${act.date}`;

          return (
            <div
              key={key}
              className="py-3 flex items-center justify-between hover:bg-forest-50/40 -mx-2 px-2.5 rounded-xl transition-colors duration-150"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {displayLabel}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateSafe(act.date)} • {formatQuantity(act.quantity, act.unit)}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-3">
                <span className="text-sm font-black text-forest-950 font-sans">
                  {formatCO2(act.co2)}
                </span>
                <span className="text-xs font-semibold text-forest-700 ml-1">kg CO₂</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivities;
