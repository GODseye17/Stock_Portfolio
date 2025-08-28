'use client';

import React from 'react';

interface FallbackUIProps {
  type: 'api-unavailable' | 'no-data' | 'loading-error' | 'network-error';
  message?: string;
  onRetry?: () => void;
}

export function FallbackUI({ type, message, onRetry }: FallbackUIProps) {
  const getFallbackContent = () => {
    switch (type) {
      case 'api-unavailable':
        return {
          icon: (
            <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          title: 'API Temporarily Unavailable',
          description: message || 'The financial data service is currently experiencing issues. We\'re working to restore service.',
          actionText: 'Retry',
        };

      case 'no-data':
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
          ),
          title: 'No Data Available',
          description: message || 'No portfolio data is currently available. Please add some stocks to get started.',
          actionText: 'Add Stock',
        };

      case 'loading-error':
        return {
          icon: (
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Loading Error',
          description: message || 'Failed to load portfolio data. Please check your connection and try again.',
          actionText: 'Retry',
        };

      case 'network-error':
        return {
          icon: (
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922a1 1 0 01-.648 1.353l-1.958.383a1 1 0 00-.796 1.037v1.263a1 1 0 001.414.914l1.263-.691a1 1 0 01.796 0l1.263.691a1 1 0 001.414-.914v-1.263a1 1 0 00-.796-1.037l-1.958-.383a1 1 0 01-.648-1.353l6.921-6.922a1 1 0 00-1.414-1.414l-6.921 6.922z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Network Connection Error',
          description: message || 'Unable to connect to the server. Please check your internet connection.',
          actionText: 'Retry',
        };

      default:
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Something Went Wrong',
          description: message || 'An unexpected error occurred. Please try again.',
          actionText: 'Retry',
        };
    }
  };

  const content = getFallbackContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        {content.icon}
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {content.title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {content.description}
        </p>
        {onRetry && (
          <div className="mt-6">
            <button
              onClick={onRetry}
              className="btn-primary"
            >
              {content.actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiUnavailableFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="financial-card">
      <FallbackUI type="api-unavailable" onRetry={onRetry} />
    </div>
  );
}

export function NoDataFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="financial-card">
      <FallbackUI type="no-data" onRetry={onRetry} />
    </div>
  );
}

export function LoadingErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="financial-card">
      <FallbackUI type="loading-error" onRetry={onRetry} />
    </div>
  );
}

export function NetworkErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="financial-card">
      <FallbackUI type="network-error" onRetry={onRetry} />
    </div>
  );
}

export function PartialDataFallback({ 
  availableData, 
  missingData, 
  onRetry 
}: { 
  availableData: string[];
  missingData: string[];
  onRetry?: () => void;
}) {
  return (
    <div className="financial-card">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto text-yellow-500">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Partial Data Available
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Some data sources are temporarily unavailable. Showing available information.
        </p>
        
        {availableData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
              Available Data:
            </h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {availableData.map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {missingData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Temporarily Unavailable:
            </h4>
            <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {missingData.map((item, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {onRetry && (
          <div className="mt-6">
            <button onClick={onRetry} className="btn-primary">
              Retry All Data Sources
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
