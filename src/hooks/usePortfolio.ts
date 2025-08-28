'use client';

import { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Stock } from '@/types/portfolio';
import { optimizedStockDataService } from '@/lib/optimizedStockDataService';
import { ApiErrorHandler } from '@/lib/errorHandling';
import { useWebSocket, stocksToSymbols, PriceUpdate } from '@/lib/websocketService';

interface PortfolioState {
  stocks: Stock[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  error: string | null;
  optimisticUpdates: Map<string, number>;
  isRealTime: boolean;
  lastRealTimeUpdate: Date | null;
}

type PortfolioAction =
  | { type: 'SET_STOCKS'; payload: Stock[] }
  | { type: 'ADD_STOCK'; payload: Stock }
  | { type: 'REMOVE_STOCK'; payload: string }
  | { type: 'UPDATE_STOCK'; payload: { id: string; updates: Partial<Stock> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_LAST_UPDATED'; payload: Date }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPTIMISTIC_PRICE'; payload: { symbol: string; price: number } }
  | { type: 'CLEAR_OPTIMISTIC_PRICE'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_REAL_TIME'; payload: boolean }
  | { type: 'SET_LAST_REAL_TIME_UPDATE'; payload: Date }
  | { type: 'UPDATE_STOCK_PRICE'; payload: { symbol: string; price: number; timestamp: Date } };

const initialState: PortfolioState = {
  stocks: [],
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  error: null,
  optimisticUpdates: new Map(),
  isRealTime: false,
  lastRealTimeUpdate: null,
};

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'SET_STOCKS':
      return {
        ...state,
        stocks: action.payload,
        isLoading: false,
        isRefreshing: false,
        lastUpdated: new Date(),
        error: null,
      };

    case 'ADD_STOCK':
      return {
        ...state,
        stocks: [...state.stocks, action.payload],
        error: null,
      };

    case 'REMOVE_STOCK':
      return {
        ...state,
        stocks: state.stocks.filter(stock => stock.id !== action.payload),
        error: null,
      };

    case 'UPDATE_STOCK':
      return {
        ...state,
        stocks: state.stocks.map(stock =>
          stock.id === action.payload.id
            ? { ...stock, ...action.payload.updates }
            : stock
        ),
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_REFRESHING':
      return {
        ...state,
        isRefreshing: action.payload,
      };

    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isRefreshing: false,
      };

    case 'SET_OPTIMISTIC_PRICE':
      return {
        ...state,
        optimisticUpdates: new Map(state.optimisticUpdates).set(
          action.payload.symbol,
          action.payload.price
        ),
      };

    case 'CLEAR_OPTIMISTIC_PRICE':
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.delete(action.payload);
      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_REAL_TIME':
      return {
        ...state,
        isRealTime: action.payload,
      };

    case 'SET_LAST_REAL_TIME_UPDATE':
      return {
        ...state,
        lastRealTimeUpdate: action.payload,
      };

    case 'UPDATE_STOCK_PRICE':
      return {
        ...state,
        stocks: state.stocks.map(stock =>
          stock.particulars === action.payload.symbol
            ? {
                ...stock,
                cmp: action.payload.price,
                presentValue: action.payload.price * stock.quantity,
                gainLoss: (action.payload.price - stock.purchasePrice) * stock.quantity,
              }
            : stock
        ),
        lastRealTimeUpdate: action.payload.timestamp,
        isRealTime: true,
      };

    default:
      return state;
  }
}

export function usePortfolio() {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const { state: wsState, connect, subscribe, subscribeToSymbols } = useWebSocket();

  const summary = useMemo(() => {
    const totalInvestment = state.stocks.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = state.stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = state.stocks.reduce((sum, stock) => sum + stock.gainLoss, 0);
    const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      totalStocks: state.stocks.length,
      totalSectors: new Set(state.stocks.map(stock => stock.sector)).size,
      bestPerformingStock: state.stocks.reduce((best, current) =>
        current.gainLoss > best.gainLoss ? current : best, state.stocks[0] || null
      ),
      worstPerformingStock: state.stocks.reduce((worst, current) =>
        current.gainLoss < worst.gainLoss ? current : worst, state.stocks[0] || null
      ),
    };
  }, [state.stocks]);

  const sectors = useMemo(() => {
    const sectorMap = new Map<string, {
      name: string;
      stocks: Stock[];
      totalInvestment: number;
      totalPresentValue: number;
      totalGainLoss: number;
      stockCount: number;
    }>();

    state.stocks.forEach(stock => {
      const existing = sectorMap.get(stock.sector);
      if (existing) {
        existing.stocks.push(stock);
        existing.totalInvestment += stock.investment;
        existing.totalPresentValue += stock.presentValue;
        existing.totalGainLoss += stock.gainLoss;
        existing.stockCount += 1;
      } else {
        sectorMap.set(stock.sector, {
          name: stock.sector,
          stocks: [stock],
          totalInvestment: stock.investment,
          totalPresentValue: stock.presentValue,
          totalGainLoss: stock.gainLoss,
          stockCount: 1,
        });
      }
    });

    return Array.from(sectorMap.values()).map(sector => ({
      ...sector,
      percentageOfPortfolio: summary.totalInvestment > 0 
        ? (sector.totalInvestment / summary.totalInvestment) * 100 
        : 0,
    }));
  }, [state.stocks, summary.totalInvestment]);

  const stocksWithOptimisticUpdates = useMemo(() => {
    return state.stocks.map(stock => {
      const optimisticPrice = state.optimisticUpdates.get(stock.particulars);
      if (optimisticPrice !== undefined) {
        const presentValue = optimisticPrice * stock.quantity;
        const gainLoss = presentValue - stock.investment;
        return {
          ...stock,
          cmp: optimisticPrice,
          presentValue,
          gainLoss,
        };
      }
      return stock;
    });
  }, [state.stocks, state.optimisticUpdates]);

  const bestPerformingSector = useMemo(() => {
    return sectors.reduce((best, current) =>
      current.totalGainLoss > best.totalGainLoss ? current : best, sectors[0] || null
    );
  }, [sectors]);

  const worstPerformingSector = useMemo(() => {
    return sectors.reduce((worst, current) =>
      current.totalGainLoss < worst.totalGainLoss ? current : worst, sectors[0] || null
    );
  }, [sectors]);

  const refreshPrices = useCallback(async () => {
    if (state.stocks.length === 0) return;

    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const updatedStocks = await ApiErrorHandler.retryWithBackoff(async () => {
        return await optimizedStockDataService.updatePortfolioPrices(state.stocks);
      });
      
      const validatedStocks = updatedStocks.map(stock => ({
        ...stock,
        cmp: ApiErrorHandler.validateCurrency(stock.cmp),
        presentValue: ApiErrorHandler.validateCurrency(stock.presentValue),
        gainLoss: ApiErrorHandler.validateNumber(stock.gainLoss),
      }));
      
      validatedStocks.forEach(stock => {
        dispatch({
          type: 'UPDATE_STOCK',
          payload: {
            id: stock.id,
            updates: {
              cmp: stock.cmp,
              presentValue: stock.presentValue,
              gainLoss: stock.gainLoss,
            },
          },
        });
      });

      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    } catch (error) {
      const apiError = ApiErrorHandler.categorizeError(error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: apiError.message
      });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.stocks]);

  const addStock = useCallback((stockData: Omit<Stock, 'id'>) => {
    const newStock: Stock = {
      ...stockData,
      id: `${stockData.particulars}_${Date.now()}`,
    };
    dispatch({ type: 'ADD_STOCK', payload: newStock });
  }, []);

  const removeStock = useCallback((stockId: string) => {
    dispatch({ type: 'REMOVE_STOCK', payload: stockId });
  }, []);

  const updateStock = useCallback((stockId: string, updates: Partial<Stock>) => {
    dispatch({ type: 'UPDATE_STOCK', payload: { id: stockId, updates } });
  }, []);

  const setOptimisticPrice = useCallback((symbol: string, price: number) => {
    dispatch({ type: 'SET_OPTIMISTIC_PRICE', payload: { symbol, price } });
  }, []);

  const clearOptimisticPrice = useCallback((symbol: string) => {
    dispatch({ type: 'CLEAR_OPTIMISTIC_PRICE', payload: symbol });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const handlePriceUpdates = useCallback((updates: PriceUpdate[]) => {
    updates.forEach(update => {
      dispatch({
        type: 'UPDATE_STOCK_PRICE',
        payload: {
          symbol: update.symbol,
          price: update.price,
          timestamp: update.timestamp,
        },
      });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(handlePriceUpdates);
    return unsubscribe;
  }, [subscribe, handlePriceUpdates]);

  useEffect(() => {
    if (state.stocks.length > 0) {
      connect();
      const symbols = stocksToSymbols(state.stocks);
      subscribeToSymbols(symbols);
    }
  }, [state.stocks, connect, subscribeToSymbols]);

  useEffect(() => {
    optimizedStockDataService.prefetchPopularSymbols();
  }, []);

  return {
    stocks: state.stocks,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    lastUpdated: state.lastUpdated,
    error: state.error,
    isRealTime: state.isRealTime,
    lastRealTimeUpdate: state.lastRealTimeUpdate,
    wsState,
    
    summary: {
      ...summary,
      bestPerformingSector,
      worstPerformingSector,
    },
    sectors,
    stocksWithOptimisticUpdates,
    
    refreshPrices,
    addStock,
    removeStock,
    updateStock,
    setOptimisticPrice,
    clearOptimisticPrice,
    clearError,
  };
}
