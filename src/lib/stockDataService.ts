import axios from 'axios';
import { YahooFinanceQuote, GoogleFinanceQuote, Stock } from '@/types/portfolio';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface BatchRequest {
  symbols: string[];
  type: 'price' | 'pe' | 'earnings' | 'all';
}

const SERVICE_CONFIG = {
  CACHE_DURATION: 60 * 1000,
  BATCH_SIZE: 5,
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
} as const;

const DEFAULT_VALUES = {
  price: 0,
  peRatio: null,
  earnings: null,
  change: 0,
  changePercent: 0,
  volume: 0,
  marketCap: 0,
} as const;

class StockDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private batchQueue: BatchRequest[] = [];
  private isProcessingBatch = false;

  constructor() {
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  async fetchCurrentMarketPrice(symbol: string): Promise<number> {
    try {
      const cacheKey = `price_${symbol.toUpperCase()}`;
      const cached = this.getCachedData<number>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      let price = await this.fetchFromYahooFinance(symbol, 'price');
      if (price === null) {
        price = await this.fetchFromGoogleFinance(symbol, 'price');
      }

      const finalPrice = price ?? DEFAULT_VALUES.price;
      this.setCachedData(cacheKey, finalPrice);
      return finalPrice;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return DEFAULT_VALUES.price;
    }
  }

  async fetchPERatio(symbol: string): Promise<number | null> {
    try {
      const cacheKey = `pe_${symbol.toUpperCase()}`;
      const cached = this.getCachedData<number | null>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      let peRatio = await this.fetchFromYahooFinance(symbol, 'pe');
      if (peRatio === null) {
        peRatio = await this.fetchFromGoogleFinance(symbol, 'pe');
      }

      const finalPeRatio = peRatio ?? DEFAULT_VALUES.peRatio;
      this.setCachedData(cacheKey, finalPeRatio);
      return finalPeRatio;
    } catch (error) {
      console.error(`Error fetching P/E ratio for ${symbol}:`, error);
      return DEFAULT_VALUES.peRatio;
    }
  }

  async fetchLatestEarnings(symbol: string): Promise<number | null> {
    try {
      const cacheKey = `earnings_${symbol.toUpperCase()}`;
      const cached = this.getCachedData<number | null>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      let earnings = await this.fetchFromYahooFinance(symbol, 'earnings');
      if (earnings === null) {
        earnings = await this.fetchFromGoogleFinance(symbol, 'earnings');
      }

      const finalEarnings = earnings ?? DEFAULT_VALUES.earnings;
      this.setCachedData(cacheKey, finalEarnings);
      return finalEarnings;
    } catch (error) {
      console.error(`Error fetching earnings for ${symbol}:`, error);
      return DEFAULT_VALUES.earnings;
    }
  }

  async fetchAllStockData(symbol: string): Promise<Partial<Stock>> {
    try {
      const cacheKey = `all_${symbol.toUpperCase()}`;
      const cached = this.getCachedData<Partial<Stock>>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const [price, peRatio, earnings] = await Promise.allSettled([
        this.fetchCurrentMarketPrice(symbol),
        this.fetchPERatio(symbol),
        this.fetchLatestEarnings(symbol),
      ]);

      const stockData: Partial<Stock> = {
        id: symbol.toUpperCase(),
        particulars: symbol.toUpperCase(),
        cmp: price.status === 'fulfilled' ? price.value : DEFAULT_VALUES.price,
        peRatio: peRatio.status === 'fulfilled' ? peRatio.value : DEFAULT_VALUES.peRatio,
        latestEarnings: earnings.status === 'fulfilled' ? earnings.value : DEFAULT_VALUES.earnings,
      };

      this.setCachedData(cacheKey, stockData);
      return stockData;
    } catch (error) {
      console.error(`Error fetching all data for ${symbol}:`, error);
      return {
        id: symbol.toUpperCase(),
        particulars: symbol.toUpperCase(),
        cmp: DEFAULT_VALUES.price,
        peRatio: DEFAULT_VALUES.peRatio,
        latestEarnings: DEFAULT_VALUES.earnings,
      };
    }
  }

  async batchFetchData(symbols: string[], type: 'price' | 'pe' | 'earnings' | 'all' = 'all'): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];

    for (let i = 0; i < uniqueSymbols.length; i += SERVICE_CONFIG.BATCH_SIZE) {
      const batch = uniqueSymbols.slice(i, i + SERVICE_CONFIG.BATCH_SIZE);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          let data: any;
          switch (type) {
            case 'price':
              data = await this.fetchCurrentMarketPrice(symbol);
              break;
            case 'pe':
              data = await this.fetchPERatio(symbol);
              break;
            case 'earnings':
              data = await this.fetchLatestEarnings(symbol);
              break;
            case 'all':
              data = await this.fetchAllStockData(symbol);
              break;
          }
          return { symbol, data, success: true };
        } catch (error) {
          console.error(`Batch fetch error for ${symbol}:`, error);
          return { symbol, data: null, success: false };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { symbol, data, success } = result.value;
          results.set(symbol, { data, success });
        }
      });

      if (i + SERVICE_CONFIG.BATCH_SIZE < uniqueSymbols.length) {
        await this.delay(500);
      }
    }

    return results;
  }

  private async fetchFromYahooFinance(symbol: string, dataType: 'price' | 'pe' | 'earnings'): Promise<any> {
    try {
      const response = await axios.get(`/api/yahoo-finance/${symbol}`, {
        timeout: SERVICE_CONFIG.REQUEST_TIMEOUT,
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as YahooFinanceQuote;
        
        switch (dataType) {
          case 'price':
            return data.regularMarketPrice;
          case 'pe':
            return data.peRatio;
          case 'earnings':
            return data.eps;
        }
      }
      return null;
    } catch (error) {
      console.error(`Yahoo Finance fetch error for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromGoogleFinance(symbol: string, dataType: 'price' | 'pe' | 'earnings'): Promise<any> {
    try {
      const response = await axios.get(`/api/google-finance/${symbol}`, {
        timeout: SERVICE_CONFIG.REQUEST_TIMEOUT,
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data as GoogleFinanceQuote;
        
        switch (dataType) {
          case 'price':
            return data.price;
          case 'pe':
            return data.peRatio;
          case 'earnings':
            return data.eps;
        }
      }
      return null;
    } catch (error) {
      console.error(`Google Finance fetch error for ${symbol}:`, error);
      return null;
    }
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + SERVICE_CONFIG.CACHE_DURATION,
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeFromCache(symbol: string): void {
    const symbolUpper = symbol.toUpperCase();
    const keysToRemove = Array.from(this.cache.keys()).filter(key => 
      key.includes(symbolUpper)
    );
    keysToRemove.forEach(key => this.cache.delete(key));
  }
}

export const stockDataService = new StockDataService();

export { StockDataService };

export type { CacheEntry, BatchRequest };
