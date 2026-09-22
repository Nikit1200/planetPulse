import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCO2 } from '../utils/formatters';

const COLORS = [
  '#16a34a', // travel
  '#0d9488', // bus
  '#0284c7', // flight
  '#f59e0b', // electricity
  '#84cc16', // veg_meal
  '#ef4444'  // nonveg_meal
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-gray-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
        <p className="font-semibold">{item.name}</p>
        <p className="text-mint-400">
          {formatCO2(item.value)} kg CO₂
        </p>
        {item.payload.count && (
          <p className="text-gray-400">
            {item.payload.count} {item.payload.count === 1 ? 'activity' : 'activities'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ categoryBreakdown }) => {
  if (!categoryBreakdown) return null;

  const categoryLabels = {
    travel: 'Travel',
    bus: 'Bus',
    flight: 'Flight',
    electricity: 'Electricity',
    veg_meal: 'Vegetarian Meal',
    nonveg_meal: 'Non-vegetarian Meal'
  };

  const data = Object.entries(categoryBreakdown)
    .map(([key, val]) => {
      const co2Val = typeof val === 'number' ? val : (val?.co2 || 0);
      return {
        name: categoryLabels[key] || val?.label || key,
        value: co2Val,
        count: val?.count || undefined
      };
    })
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="card-base p-6 flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mb-3">
          <span className="text-xl">📊</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No Category Data</h3>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          Log activities to see a breakdown of your emissions by activity type.
        </p>
      </div>
    );
  }

  return (
    <div className="card-base p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">
        Emissions by Category
      </h3>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-gray-700 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
