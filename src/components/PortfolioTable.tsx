'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { Stock } from '@/types/portfolio';
import SparklineChart from './SparklineChart';
import { PERatioTooltip, EarningsTooltip, MarketCapTooltip } from './Tooltip';
import { TableSkeleton } from './SkeletonComponents';
import { PriceChangeIndicator } from './RealTimeIndicator';

interface PortfolioTableProps {
  data: Stock[];
  isLoading?: boolean;
  onRowClick?: (stock: Stock) => void;
  isRealTime?: boolean;
}

const columnHelper = createColumnHelper<Stock>();

const generateSparklineData = (basePrice: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    date: `2024-${String(i + 1).padStart(2, '0')}-01`,
    price: basePrice + (Math.random() - 0.5) * basePrice * 0.1,
  }));
};

const PortfolioTable: React.FC<PortfolioTableProps> = ({ data, isLoading = false, onRowClick, isRealTime = false }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const columns = useMemo<ColumnDef<Stock, any>[]>(() => [
    columnHelper.accessor('particulars', {
      header: 'Stock',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {row.original.particulars.charAt(0)}
              </span>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.original.particulars}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.exchange}
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('purchasePrice', {
      header: 'Purchase Price',
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(getValue())}
        </div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {formatNumber(getValue())}
        </div>
      ),
    }),
    columnHelper.accessor('investment', {
      header: 'Investment',
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(getValue())}
        </div>
      ),
    }),
    columnHelper.accessor('portfolioPercentage', {
      header: 'Portfolio %',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getValue().toFixed(1)}%
        </div>
      ),
    }),
    columnHelper.accessor('cmp', {
      header: 'CMP',
      cell: ({ getValue, row }) => {
        const currentPrice = getValue();
        const previousPrice = row.original.purchasePrice;
        const change = currentPrice - previousPrice;
        const changePercent = ((change / previousPrice) * 100);
        
        return (
          <div className="space-y-1">
            <div className={`text-sm font-semibold text-gray-900 dark:text-white ${isRealTime ? 'animate-pulse' : ''}`}>
              {formatCurrency(currentPrice)}
            </div>
            {isRealTime && (
              <PriceChangeIndicator 
                change={change} 
                changePercent={changePercent} 
              />
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('presentValue', {
      header: 'Present Value',
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(getValue())}
        </div>
      ),
    }),
    columnHelper.accessor('gainLoss', {
      header: 'Gain/Loss',
      cell: ({ getValue, row }) => {
        const value = getValue();
        const percentage = ((value / row.original.investment) * 100);
        return (
          <div className="space-y-1">
            <div className={`text-sm font-semibold ${value >= 0 ? 'value-change-positive' : 'value-change-negative'}`}>
              {value >= 0 ? '+' : ''}{formatCurrency(value)}
            </div>
            <div className={`text-xs ${value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPercentage(percentage)}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('peRatio', {
      header: 'P/E Ratio',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <PERatioTooltip>
            <div className="text-sm text-gray-900 dark:text-white cursor-help">
              {value ? value.toFixed(2) : 'N/A'}
            </div>
          </PERatioTooltip>
        );
      },
    }),
    columnHelper.accessor('latestEarnings', {
      header: 'Latest Earnings',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <EarningsTooltip>
            <div className="text-sm text-gray-900 dark:text-white cursor-help">
              {value ? formatCurrency(value) : 'N/A'}
            </div>
          </EarningsTooltip>
        );
      },
    }),
    columnHelper.accessor('sector', {
      header: 'Sector',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'sparkline',
      header: 'Trend',
      cell: ({ row }) => (
        <div className="sparkline-container">
          <SparklineChart
            data={generateSparklineData(row.original.cmp)}
            width={60}
            height={30}
            showTooltip={true}
          />
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
          <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search stocks..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Total: {data.length} stocks</span>
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="table-header"
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="table-row cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            {globalFilter ? 'No stocks found matching your search.' : 'No stocks in portfolio.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTable;
