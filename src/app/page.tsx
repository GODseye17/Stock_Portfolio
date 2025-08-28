'use client';

import ErrorBoundary from '@/components/ErrorBoundary';
import PortfolioManager from '@/components/PortfolioManager';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <PortfolioManager />
        </ErrorBoundary>
      </div>
    </div>
  );
}
