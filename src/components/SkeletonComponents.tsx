'use client';

import React, { memo } from 'react';

const Skeleton = memo(({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
));

Skeleton.displayName = 'Skeleton';

export const TableSkeleton = memo(() => (
  <div className="w-full">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>

    <div className="mb-4">
      <Skeleton className="h-10 w-64" />
    </div>

    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[...Array(12)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(12)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

export const CardSkeleton = memo(({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

export const PortfolioSummarySkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="mt-4 md:mt-0 flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-lg">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  </div>
));

PortfolioSummarySkeleton.displayName = 'PortfolioSummarySkeleton';

export const SectorBreakdownSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  </div>
));

SectorBreakdownSkeleton.displayName = 'SectorBreakdownSkeleton';

export const FormSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="md:col-span-2 lg:col-span-4">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
));

FormSkeleton.displayName = 'FormSkeleton';

export const StatisticsSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  </div>
));

StatisticsSkeleton.displayName = 'StatisticsSkeleton';

export const OptimisticUpdateSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <Skeleton className="h-6 w-40 mb-4" />
    <Skeleton className="h-4 w-96 mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  </div>
));

OptimisticUpdateSkeleton.displayName = 'OptimisticUpdateSkeleton';

export const LoadingSpinner = memo(({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export const ProgressBarSkeleton = memo(() => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
  </div>
));

ProgressBarSkeleton.displayName = 'ProgressBarSkeleton';

export const ChartSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

export default Skeleton;
