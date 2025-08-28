'use client';

import { useState, useEffect } from 'react';
import { stockDataService } from '@/lib/stockDataService';
import { Stock } from '@/types/portfolio';

interface StockDataExampleProps {
  symbols?: string[];
}

export default function StockDataExample({ symbols = ['AAPL', 'GOOGL', 'MSFT'] }: StockDataExampleProps) {
  const [stockData, setStockData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });

  const fetchStockPrice = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const price = await stockDataService.fetchCurrentMarketPrice(symbol);
      setStockData(prev => new Map(prev).set(symbol, { price, type: 'price' }));
    } catch (err) {
      setError(`Failed to fetch price for ${symbol}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPERatio = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const peRatio = await stockDataService.fetchPERatio(symbol);
      setStockData(prev => new Map(prev).set(symbol, { peRatio, type: 'pe' }));
    } catch (err) {
      setError(`Failed to fetch P/E ratio for ${symbol}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const earnings = await stockDataService.fetchLatestEarnings(symbol);
      setStockData(prev => new Map(prev).set(symbol, { earnings, type: 'earnings' }));
    } catch (err) {
      setError(`Failed to fetch earnings for ${symbol}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const allData = await stockDataService.fetchAllStockData(symbol);
      setStockData(prev => new Map(prev).set(symbol, { ...allData, type: 'all' }));
    } catch (err) {
      setError(`Failed to fetch all data for ${symbol}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const batchFetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await stockDataService.batchFetchData(symbols, 'all');
      setStockData(results);
    } catch (err) {
      setError('Failed to batch fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCacheStats = () => {
    setCacheStats(stockDataService.getCacheStats());
  };

  const clearCache = () => {
    stockDataService.clearCache();
    updateCacheStats();
  };

  useEffect(() => {
    updateCacheStats();
  }, [stockData]);

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'price':
        return `$${value.toFixed(2)}`;
      case 'pe':
        return value.toFixed(2);
      case 'earnings':
        return `$${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stock Data Service Example</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Cache Statistics</h3>
          <p className="text-sm text-gray-600">
            Cache Size: {cacheStats.size} entries
          </p>
          <div className="mt-2 space-x-2">
            <button
              onClick={updateCacheStats}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Refresh Stats
            </button>
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Clear Cache
            </button>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={batchFetchAll}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Batch Fetch All Symbols'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {symbols.map((symbol) => (
            <div key={symbol} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{symbol}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => fetchStockPrice(symbol)}
                  disabled={loading}
                  className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  Get Price
                </button>
                <button
                  onClick={() => fetchPERatio(symbol)}
                  disabled={loading}
                  className="w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  Get P/E Ratio
                </button>
                <button
                  onClick={() => fetchEarnings(symbol)}
                  disabled={loading}
                  className="w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  Get Earnings
                </button>
                <button
                  onClick={() => fetchAllData(symbol)}
                  disabled={loading}
                  className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  Get All Data
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          {Array.from(stockData.entries()).map(([symbol, data]) => (
            <div key={symbol} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">{symbol}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {data.price !== undefined && (
                  <div>
                    <span className="font-medium">Price:</span> {formatValue(data.price, 'price')}
                  </div>
                )}
                {data.peRatio !== undefined && (
                  <div>
                    <span className="font-medium">P/E Ratio:</span> {formatValue(data.peRatio, 'pe')}
                  </div>
                )}
                {data.earnings !== undefined && (
                  <div>
                    <span className="font-medium">Earnings:</span> {formatValue(data.earnings, 'earnings')}
                  </div>
                )}
                {data.cmp !== undefined && (
                  <div>
                    <span className="font-medium">Current Price:</span> {formatValue(data.cmp, 'price')}
                  </div>
                )}
                {data.success !== undefined && (
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={data.success ? 'text-green-600' : 'text-red-600'}>
                      {data.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
