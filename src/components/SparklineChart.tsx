'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineChartProps {
  data: Array<{ date: string; price: number }>;
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
}

export default function SparklineChart({
  data,
  width = 60,
  height = 30,
  color = '#3b82f6',
  showTooltip = false,
}: SparklineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        date: `2024-${String(i + 1).padStart(2, '0')}-01`,
        price: 100 + Math.random() * 50,
      }));
    }
    return data;
  }, [data]);

  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return last >= first;
  }, [chartData]);

  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="relative">
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
                      <p className="font-medium">
                        ₹{numericValue.toFixed(2)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {payload[0].payload.date}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
