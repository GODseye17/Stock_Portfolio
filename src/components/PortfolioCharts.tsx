'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Stock } from '@/types/portfolio';

interface PortfolioChartsProps {
  stocks: Stock[];
  sectors: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export default function PortfolioCharts({ stocks, sectors }: PortfolioChartsProps) {
  const sectorData = useMemo(() => {
    return sectors.map((sector, index) => ({
      name: sector.name,
      value: sector.totalPresentValue,
      color: COLORS[index % COLORS.length],
    }));
  }, [sectors]);

  const topPerformers = useMemo(() => {
    return stocks
      .sort((a, b) => b.gainLoss - a.gainLoss)
      .slice(0, 10)
      .map(stock => ({
        name: stock.particulars,
        gainLoss: stock.gainLoss,
        gainLossPercent: ((stock.gainLoss / stock.investment) * 100),
      }));
  }, [stocks]);

  const portfolioTrend = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: 1000000 + Math.random() * 200000,
    }));
  }, []);

  const sectorPerformance = useMemo(() => {
    return sectors.map(sector => ({
      name: sector.name,
      investment: sector.totalInvestment,
      currentValue: sector.totalPresentValue,
      gainLoss: sector.totalGainLoss,
      gainLossPercent: sector.totalGainLoss > 0 ? 
        ((sector.totalGainLoss / sector.totalInvestment) * 100) : 
        ((sector.totalGainLoss / sector.totalInvestment) * 100),
    }));
  }, [sectors]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="financial-card">
        <div className="card-header">
          <h3 className="card-title">Portfolio Value Trend (Last 30 Days)</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="financial-card">
          <div className="card-header">
            <h3 className="card-title">Sector Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="financial-card">
          <div className="card-header">
            <h3 className="card-title">Top Performers (Gain/Loss)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#6B7280"
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="#6B7280"
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Gain/Loss']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="gainLoss" 
                  fill={(entry: any) => entry.gainLoss >= 0 ? '#10B981' : '#EF4444'}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="financial-card">
        <div className="card-header">
          <h3 className="card-title">Sector Performance Comparison</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'investment' ? 'Investment' : 
                  name === 'currentValue' ? 'Current Value' : 'Gain/Loss'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="investment" fill="#6B7280" name="Investment" />
              <Bar dataKey="currentValue" fill="#3B82F6" name="Current Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="financial-card">
        <div className="card-header">
          <h3 className="card-title">Individual Stock Performance</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stocks.slice(0, 15).map(stock => ({
              name: stock.particulars,
              purchasePrice: stock.purchasePrice,
              currentPrice: stock.cmp,
              gainLoss: stock.gainLoss,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'purchasePrice' ? 'Purchase Price' : 
                  name === 'currentPrice' ? 'Current Price' : 'Gain/Loss'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="purchasePrice" 
                stroke="#6B7280" 
                strokeWidth={2}
                dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="currentPrice" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
