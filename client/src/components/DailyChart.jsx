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
import { formatCO2 } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
        <p className="font-semibold">{label} ({data.date})</p>
        <p className="text-emerald-400">
          {formatCO2(data.co2)} kg CO₂
        </p>
        <p className="text-gray-400">
          {data.count} {data.count === 1 ? 'activity' : 'activities'}
        </p>
      </div>
    );
  }
  return null;
};

const DailyChart = ({ dailyBreakdown }) => {
  if (!dailyBreakdown || dailyBreakdown.length === 0) return null;

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">
          Daily Emissions (Mon – Sun)
        </h3>
        <span className="text-xs text-gray-500 font-medium">kg CO₂ / day</span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(22, 163, 74, 0.05)' }} />
            <Bar
              dataKey="co2"
              fill="#15803d"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyChart;
