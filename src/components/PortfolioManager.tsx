'use client';

import { useState, useEffect, memo } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Stock } from '@/types/portfolio';
import PortfolioTable from './PortfolioTable';
import ErrorBoundary from './ErrorBoundary';
import DarkModeToggle from './DarkModeToggle';
import SparklineChart from './SparklineChart';
import PortfolioCharts from './PortfolioCharts';
import ConnectionStatus from './ConnectionStatus';
import RealTimeIndicator, { LivePriceIndicator } from './RealTimeIndicator';
import { PERatioTooltip, EarningsTooltip, MarketCapTooltip } from './Tooltip';
import { useToast, showSuccess, showError, showWarning, showApiError } from './Toast';
import { ApiErrorHandler } from '@/lib/errorHandling';
import { 
  ApiUnavailableFallback, 
  NoDataFallback, 
  LoadingErrorFallback, 
  NetworkErrorFallback,
  PartialDataFallback 
} from './FallbackUI';
import { 
  PortfolioSummarySkeleton, 
  SectorBreakdownSkeleton, 
  FormSkeleton, 
  StatisticsSkeleton,
  OptimisticUpdateSkeleton,
  LoadingSpinner 
} from './SkeletonComponents';
import { initialPortfolioWithPercentages } from '@/data/initialPortfolio';

const PortfolioSummaryCards = memo(({ summary }: { summary: any }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <div className="metric-card hover-lift">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Investment</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {formatCurrency(summary.totalInvestment)}
        </div>
      </div>
      <div className="metric-card hover-lift">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {formatCurrency(summary.totalPresentValue)}
        </div>
      </div>
      <div className={`metric-card hover-lift ${summary.totalGainLoss >= 0 ? 'metric-card-success' : 'metric-card-danger'}`}>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gain/Loss</div>
        <div className={`text-2xl font-bold mt-1 ${summary.totalGainLoss >= 0 ? 'value-change-positive' : 'value-change-negative'}`}>
          {summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
        </div>
      </div>
      <div className={`metric-card hover-lift ${summary.totalGainLossPercentage >= 0 ? 'metric-card-success' : 'metric-card-danger'}`}>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Return %</div>
        <div className={`text-2xl font-bold mt-1 ${summary.totalGainLossPercentage >= 0 ? 'value-change-positive' : 'value-change-negative'}`}>
          {formatPercentage(summary.totalGainLossPercentage)}
        </div>
      </div>
    </div>
  );
});

PortfolioSummaryCards.displayName = 'PortfolioSummaryCards';

const SectorBreakdown = memo(({ sectors }: { sectors: any[] }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
      {sectors.map((sector) => (
        <div key={sector.name} className="financial-card hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">{sector.name}</h4>
            <span className="badge badge-primary">{sector.stockCount} stocks</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Investment:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(sector.totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Value:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(sector.totalPresentValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Gain/Loss:</span>
              <span className={`font-semibold ${sector.totalGainLoss >= 0 ? 'value-change-positive' : 'value-change-negative'}`}>
                {sector.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(sector.totalGainLoss)}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {sector.percentageOfPortfolio.toFixed(1)}% of portfolio
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

SectorBreakdown.displayName = 'SectorBreakdown';

const AddStockForm = memo(({ 
  showAddForm, 
  setShowAddForm, 
  newStock, 
  setNewStock, 
  handleAddStock 
}: {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  newStock: any;
  setNewStock: (stock: any) => void;
  handleAddStock: (e: React.FormEvent) => void;
}) => {
  if (!showAddForm) return null;

  return (
    <div className="financial-card animate-fade-in">
      <div className="card-header">
        <h3 className="card-title">Add New Stock</h3>
      </div>
      <form onSubmit={handleAddStock} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="form-label">Symbol</label>
          <input
            type="text"
            value={newStock.particulars}
            onChange={(e) => setNewStock({ ...newStock, particulars: e.target.value.toUpperCase() })}
            className="form-input"
            placeholder="RELIANCE"
            required
          />
        </div>
        <div>
          <label className="form-label">Purchase Price</label>
          <input
            type="number"
            step="0.01"
            value={newStock.purchasePrice}
            onChange={(e) => setNewStock({ ...newStock, purchasePrice: parseFloat(e.target.value) || 0 })}
            className="form-input"
            placeholder="2450.00"
            required
          />
        </div>
        <div>
          <label className="form-label">Quantity</label>
          <input
            type="number"
            value={newStock.quantity}
            onChange={(e) => setNewStock({ ...newStock, quantity: parseInt(e.target.value) || 0 })}
            className="form-input"
            placeholder="100"
            required
          />
        </div>
        <div>
          <label className="form-label">Sector</label>
          <select
            value={newStock.sector}
            onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
            className="form-select"
          >
            <option value="Technology">Technology</option>
            <option value="Financial">Financial</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Consumer Goods">Consumer Goods</option>
            <option value="Energy">Energy</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Metals">Metals</option>
            <option value="Oil & Gas">Oil & Gas</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex space-x-3">
          <button type="submit" className="btn-success">
            Add Stock
          </button>
          <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

AddStockForm.displayName = 'AddStockForm';

const OptimisticUpdatesDemo = memo(({ 
  stocks, 
  handleOptimisticPriceUpdate 
}: {
  stocks: Stock[];
  handleOptimisticPriceUpdate: (symbol: string, price: number) => void;
}) => (
  <div className="financial-card animate-fade-in">
    <div className="card-header">
      <h3 className="card-title">Optimistic Updates Demo</h3>
      <p className="card-subtitle">
        Click on a stock to simulate an optimistic price update. The change will be visible immediately and cleared after 2 seconds.
      </p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stocks.slice(0, 4).map((stock) => (
        <button
          key={stock.id}
          onClick={() => handleOptimisticPriceUpdate(stock.particulars, stock.cmp * 1.05)}
          className="financial-card hover-scale text-left transition-all-smooth"
        >
          <div className="font-medium text-gray-900 dark:text-white">{stock.particulars}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current: ₹{stock.cmp}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Click to simulate +5%</div>
        </button>
      ))}
    </div>
  </div>
));

OptimisticUpdatesDemo.displayName = 'OptimisticUpdatesDemo';

const PortfolioManager = memo(() => {
  const { addToast } = useToast();
  const {
    stocks,
    isLoading,
    isRefreshing,
    lastUpdated,
    error,
    isRealTime,
    lastRealTimeUpdate,
    wsState,
    summary,
    sectors,
    stocksWithOptimisticUpdates,
    refreshPrices,
    addStock,
    removeStock,
    updateStock,
    clearError,
    setOptimisticPrice,
    clearOptimisticPrice,
  } = usePortfolio();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState<Partial<Omit<Stock, 'id'>>>({
    particulars: '',
    purchasePrice: 0,
    quantity: 0,
    exchange: 'NSE',
    sector: 'Technology',
  });

  useEffect(() => {
    if (stocks.length === 0) {
      initialPortfolioWithPercentages.forEach(stock => addStock(stock));
    }
  }, [stocks.length, addStock]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && stocks.length > 0) {
        refreshPrices();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshPrices, isLoading, stocks.length]);

  const handleOptimisticPriceUpdate = (symbol: string, price: number) => {
    setOptimisticPrice(symbol, price);
    
    setTimeout(() => {
      clearOptimisticPrice(symbol);
    }, 2000);
  };

  const handleRefreshWithRetry = async () => {
    try {
      await ApiErrorHandler.retryWithBackoff(async () => {
        await refreshPrices();
      });
      addToast(showSuccess('Success', 'Portfolio data refreshed successfully'));
    } catch (error) {
      const apiError = ApiErrorHandler.categorizeError(error);
      addToast(showApiError(apiError));
    }
  };

  const handleAddStockWithValidation = (stockData: Omit<Stock, 'id'>) => {
    try {
      const validatedStock = {
        ...stockData,
        purchasePrice: ApiErrorHandler.validateCurrency(stockData.purchasePrice),
        quantity: ApiErrorHandler.validateNumber(stockData.quantity, 1),
        investment: ApiErrorHandler.validateCurrency(stockData.purchasePrice * stockData.quantity),
        cmp: ApiErrorHandler.validateCurrency(stockData.cmp),
        presentValue: ApiErrorHandler.validateCurrency(stockData.purchasePrice * stockData.quantity),
        gainLoss: ApiErrorHandler.calculateGainLoss(
          stockData.purchasePrice,
          stockData.cmp,
          stockData.quantity
        ),
        portfolioPercentage: 0,
      };

      addStock(validatedStock);
      addToast(showSuccess('Stock Added', `${stockData.particulars} has been added to your portfolio`));
    } catch (error) {
      addToast(showError('Validation Error', 'Please check the stock data and try again'));
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock.particulars && newStock.purchasePrice && newStock.quantity) {
      const stockData: Omit<Stock, 'id'> = {
        particulars: newStock.particulars,
        purchasePrice: newStock.purchasePrice,
        quantity: newStock.quantity,
        investment: newStock.purchasePrice * newStock.quantity,
        portfolioPercentage: 0,
        exchange: newStock.exchange || 'NSE',
        cmp: newStock.purchasePrice,
        presentValue: newStock.purchasePrice * newStock.quantity,
        gainLoss: 0,
        peRatio: null,
        latestEarnings: null,
        sector: newStock.sector || 'Technology',
      };
      
      handleAddStockWithValidation(stockData);
      setNewStock({
        particulars: '',
        purchasePrice: 0,
        quantity: 0,
        exchange: 'NSE',
        sector: 'Technology',
      });
      setShowAddForm(false);
    } else {
      addToast(showWarning('Validation Error', 'Please fill in all required fields'));
    }
  };

  if (isLoading && stocks.length === 0) {
    return (
      <div className="space-y-6">
        <PortfolioSummarySkeleton />
        <SectorBreakdownSkeleton />
        <FormSkeleton />
        <StatisticsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="financial-card animate-fade-in">
        <div className="financial-header">
          <div>
            <h2 className="financial-title">Portfolio Manager</h2>
            <div className="flex items-center space-x-4">
              <p className="financial-subtitle">
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </p>
              <LivePriceIndicator 
                isUpdating={isRealTime} 
                lastUpdate={lastRealTimeUpdate || lastUpdated || undefined} 
              />
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Based on real Indian stock market data from CSV
              </p>
              <ConnectionStatus />
              <RealTimeIndicator state={wsState} isUpdating={isRealTime} />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-success"
            >
              {showAddForm ? 'Cancel' : 'Add Stock'}
            </button>
            <button
              onClick={handleRefreshWithRetry}
              disabled={isRefreshing}
              className={`btn-primary ${isRefreshing ? 'disabled' : ''}`}
            >
              {isRefreshing && <LoadingSpinner size="sm" className="mr-2" />}
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Prices'}</span>
            </button>
          </div>
        </div>

        <PortfolioSummaryCards summary={summary} />
      </div>

      {error && (
        <div className="animate-fade-in">
          {error.includes('network') || error.includes('connection') ? (
            <NetworkErrorFallback onRetry={handleRefreshWithRetry} />
          ) : error.includes('API') || error.includes('service') ? (
            <ApiUnavailableFallback onRetry={handleRefreshWithRetry} />
          ) : (
            <LoadingErrorFallback onRetry={handleRefreshWithRetry} />
          )}
        </div>
      )}

      {!isLoading && !error && stocks.length === 0 && (
        <NoDataFallback onRetry={() => setShowAddForm(true)} />
      )}

      <AddStockForm
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        newStock={newStock}
        setNewStock={setNewStock}
        handleAddStock={handleAddStock}
      />

      <div className="financial-card animate-slide-in">
        <div className="card-header">
          <h3 className="card-title">Sector Breakdown</h3>
        </div>
        <SectorBreakdown sectors={sectors} />
      </div>

      <ErrorBoundary>
        <div className="financial-card animate-fade-in">
          <div className="card-header">
            <h3 className="card-title">Portfolio Holdings</h3>
          </div>
          <PortfolioTable 
            data={stocksWithOptimisticUpdates}
            isLoading={isRefreshing}
            isRealTime={isRealTime}
            onRowClick={(stock) => {
              console.log('Selected stock:', stock);
            }}
          />
        </div>
      </ErrorBoundary>

      <OptimisticUpdatesDemo
        stocks={stocks}
        handleOptimisticPriceUpdate={handleOptimisticPriceUpdate}
      />

      <PortfolioCharts stocks={stocks} sectors={sectors} />

      <div className="financial-card animate-fade-in">
        <div className="card-header">
          <h3 className="card-title">Portfolio Statistics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Stocks</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalStocks}</div>
          </div>
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-green-600 dark:text-green-400">Total Sectors</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.totalSectors}</div>
          </div>
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Best Performer</div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              {summary.bestPerformingStock?.particulars || 'N/A'}
            </div>
          </div>
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Worst Performer</div>
            <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {summary.worstPerformingStock?.particulars || 'N/A'}
            </div>
          </div>
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Best Sector</div>
            <div className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              {summary.bestPerformingSector?.name || 'N/A'}
            </div>
          </div>
          <div className="metric-card hover-lift">
            <div className="text-sm font-medium text-red-600 dark:text-red-400">Worst Sector</div>
            <div className="text-lg font-semibold text-red-900 dark:text-red-100">
              {summary.worstPerformingSector?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PortfolioManager.displayName = 'PortfolioManager';

export default PortfolioManager;
