'use client';

import ErrorBoundary from '@/components/ErrorBoundary';
import PortfolioManager from '@/components/PortfolioManager';
import ApiTestComponent from '@/components/ApiTestComponent';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ErrorBoundary>
          <ApiTestComponent />
        </ErrorBoundary>
        <ErrorBoundary>
          <PortfolioManager />
        </ErrorBoundary>
      </div>
    </div>
  );
}
