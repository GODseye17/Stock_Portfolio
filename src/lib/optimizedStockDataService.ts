import { stockDataService } from './stockDataService';
import { Stock } from '@/types/portfolio';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
}

class OptimizedStockDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_SIZE_LIMIT = 1000;
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private refreshTimeout: NodeJS.Timeout | null = null;

  constructor() {
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  private debouncedRefresh(symbols: string[]): Promise<Map<string, any>> {
    return new Promise((resolve) => {
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }
      
      this.refreshTimeout = setTimeout(async () => {
        try {
          const results = await stockDataService.batchFetchData(symbols, 'price');
          resolve(results);
        } catch (error) {
          console.error('Debounced refresh failed:', error);
          resolve(new Map());
        }
      }, 500);
    });
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      entry.accessCount++;
      return entry.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    if (this.cache.size >= this.CACHE_SIZE_LIMIT) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
      const toDelete = entries.slice(0, Math.floor(this.CACHE_SIZE_LIMIT * 0.2));
      toDelete.forEach(([key]) => this.cache.delete(key));
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      accessCount: 1,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  async batchFetchPrices(symbols: string[]): Promise<Map<string, number>> {
    const uniqueSymbols = [...new Set(symbols)];
    const priceMap = new Map<string, number>();
    const symbolsToFetch: string[] = [];

    for (const symbol of uniqueSymbols) {
      const cachedPrice = this.getCachedData<number>(`price_${symbol}`);
      if (cachedPrice !== null) {
        priceMap.set(symbol, cachedPrice);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    if (symbolsToFetch.length > 0) {
      try {
        const results = await this.debouncedRefresh(symbolsToFetch);
        
        results.forEach((result: any, symbol: string) => {
          if (result.success && result.data !== null) {
            const price = result.data;
            priceMap.set(symbol, price);
            this.setCachedData(`price_${symbol}`, price);
          }
        });
      } catch (error) {
        console.error('Batch price fetch failed:', error);
      }
    }

    return priceMap;
  }

  async updatePortfolioPrices(stocks: Stock[]): Promise<Stock[]> {
    const symbols = stocks.map(stock => stock.particulars);
    const priceMap = await this.batchFetchPrices(symbols);

    return stocks.map(stock => {
      const newPrice = priceMap.get(stock.particulars);
      if (newPrice !== undefined) {
        const presentValue = newPrice * stock.quantity;
        const gainLoss = presentValue - stock.investment;
        
        return {
          ...stock,
          cmp: newPrice,
          presentValue,
          gainLoss,
        };
      }
      return stock;
    });
  }

  async prefetchPopularSymbols(): Promise<void> {
    const popularSymbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
      'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK'
    ];

    try {
      await this.batchFetchPrices(popularSymbols);
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  }

  getCacheStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    oldestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0;

    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? totalAccesses / this.cache.size : 0,
      totalAccesses,
      oldestEntry,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeFromCache(symbol: string): void {
    this.cache.delete(`price_${symbol}`);
  }
}

export const optimizedStockDataService = new OptimizedStockDataService();
