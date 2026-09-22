import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCO2, formatDateSafe } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-forest-950 text-white p-3.5 rounded-xl shadow-xl border border-forest-800 text-xs space-y-1 animate-scale-in">
        <p className="font-bold text-gray-200">
          {data.day} • {formatDateSafe(data.date)}
        </p>
        <p className="text-mint-400 font-black text-sm">
          {formatCO2(data.co2)} kg CO₂
        </p>
        <p className="text-gray-400 text-[11px]">
          {data.activityCount} {data.activityCount === 1 ? 'activity' : 'activities'} logged
        </p>
      </div>
    );
  }
  return null;
};

const DailyBreakdown = ({ dailyBreakdown = [] }) => {
  // Ensure day labels are concise for mobile rendering
  const formattedData = dailyBreakdown.map((item) => {
    const shortDay = item.day ? item.day.substring(0, 3) : '';
    return {
      ...item,
      shortDay,
      co2: Number(item.co2 || 0),
      activityCount: Number(item.activityCount || 0)
    };
  });

  return (
    <div className="card-base p-6 bg-white rounded-2xl border border-gray-200/80 shadow-card flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Daily Footprint
            </h3>
            <p className="text-xs text-gray-500">
              Monday through Sunday cycle
            </p>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
            kg CO₂ / day
          </span>
        </div>

        {/* Responsive Bar Chart */}
        <div className="h-[220px] sm:h-[240px] w-full" aria-label="Daily emissions bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f1" />
              <XAxis
                dataKey="shortDay"
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(21, 128, 61, 0.05)', radius: 6 }}
              />
              <Bar
                dataKey="co2"
                fill="#15803d"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accessible text summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <details className="text-xs text-gray-500 group">
          <summary className="cursor-pointer font-bold text-forest-800 hover:text-forest-900 select-none">
            View daily text summary
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-50">
            {formattedData.map((d) => (
              <div key={d.date} className="p-2 rounded-xl bg-gray-50 text-[11px] border border-gray-100">
                <span className="font-bold text-gray-700">{d.day}:</span>{' '}
                <span className="font-extrabold text-forest-950">{formatCO2(d.co2)} kg</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default DailyBreakdown;
