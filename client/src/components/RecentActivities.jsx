import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Car, Bus, Plane, Zap, Salad, Beef } from 'lucide-react';
import { formatCO2, formatDate, formatQuantity } from '../utils/formatters';

const iconMap = {
  travel: Car,
  bus: Bus,
  flight: Plane,
  electricity: Zap,
  veg_meal: Salad,
  nonveg_meal: Beef
};

const labelMap = {
  travel: 'Travel',
  bus: 'Bus',
  flight: 'Flight',
  electricity: 'Electricity',
  veg_meal: 'Vegetarian Meal',
  nonveg_meal: 'Non-veg Meal'
};

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mb-3">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-gray-900">No activities recorded yet.</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Start tracking your footprint by logging your first activity.
        </p>
        <Link
          to="/log"
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Activity</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Recent Activities</h3>
        <Link
          to="/history"
          className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center space-x-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((act) => {
          const Icon = iconMap[act.type] || Car;
          const label = labelMap[act.type] || act.type;

          return (
            <div key={act._id} className="py-3 flex items-center justify-between hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(act.date)} • {formatQuantity(act.quantity, act.unit)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-gray-900">
                  {formatCO2(act.co2)}
                </span>
                <span className="text-xs text-gray-500 ml-1">kg CO₂</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivities;
