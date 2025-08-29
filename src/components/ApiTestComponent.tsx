'use client';

import React, { useState } from 'react';

interface ApiTestComponentProps {
  symbols?: string[];
}

export default function ApiTestComponent({ symbols = ['AAPL', 'GOOGL', 'MSFT'] }: ApiTestComponentProps) {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testYahooFinance = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = Date.now();
      const response = await fetch(`/api/yahoo-finance/${symbol}`);
      const endTime = Date.now();
      
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [symbol]: {
          success: data.success,
          data: data.data,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log(`${symbol} API Response:`, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`${symbol} API Error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const testBatchAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startTime = Date.now();
      const response = await fetch('/api/stock-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });
      const endTime = Date.now();
      
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        batch: {
          success: data.success,
          data: data.data,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('Batch API Response:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Batch API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults({});
    setError(null);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">API Testing Tool</h3>
        <p className="text-sm text-gray-500">Test API endpoints and debug timeout issues</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testBatchAPI}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Testing...' : 'Test Batch API'}
          </button>
          
          {symbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() => testYahooFinance(symbol)}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Testing...' : `Test ${symbol}`}
            </button>
          ))}
          
          <button
            onClick={clearResults}
            className="btn-danger"
          >
            Clear Results
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error:</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">API Test Results:</h4>
            
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{key === 'batch' ? 'Batch API' : key}</h5>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Response Time:</span> {result.responseTime}ms</p>
                  <p><span className="font-medium">Timestamp:</span> {result.timestamp}</p>
                  
                  {result.data && (
                    <div>
                      <p className="font-medium">Data:</p>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
