import { NextRequest } from 'next/server';
import axios from 'axios';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export const globalCache = new Map<string, CacheEntry<any>>();
export const globalRateLimitMap = new Map<string, RateLimitEntry>();

export const API_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000,
  RATE_LIMIT_WINDOW: 60 * 1000,
  MAX_REQUESTS_PER_WINDOW: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 10000,
} as const;

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

export function checkRateLimit(ip: string, maxRequests: number = API_CONFIG.MAX_REQUESTS_PER_WINDOW): boolean {
  const now = Date.now();
  const entry = globalRateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    globalRateLimitMap.set(ip, {
      count: 1,
      resetTime: now + API_CONFIG.RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

export function getCachedData<T>(key: string): T | null {
  const entry = globalCache.get(key);
  
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T;
  }
  
  return null;
}

export function setCachedData<T>(key: string, data: T, duration: number = API_CONFIG.CACHE_DURATION): void {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  });
  
  if (globalCache.size > 100) {
    const entries = Array.from(globalCache.entries());
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const toDelete = entries.slice(100);
    toDelete.forEach(([key]) => globalCache.delete(key));
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  baseDelay: number = API_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

export const httpClient = axios.create({
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
  },
});

export function handleApiError(error: unknown, context: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    switch (status) {
      case 429:
        return 'Rate limit exceeded. Please try again later.';
      case 404:
        return 'Data not found. Please check the symbol and try again.';
      case 403:
        return 'Access denied. Please check your API key or permissions.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `HTTP ${status}: ${message}`;
    }
  }
  
  return error instanceof Error ? error.message : 'Unknown error occurred';
}

export function formatApiResponse<T>(
  data: T | null,
  success: boolean = true,
  error: string | null = null
) {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

export function isValidSymbol(symbol: string): boolean {
  const symbolRegex = /^[A-Z0-9.-]+$/;
  return symbolRegex.test(symbol) && symbol.length <= 10;
}

export function sanitizeSymbol(symbol: string): string {
  return symbol.toUpperCase().trim().replace(/[^A-Z0-9.-]/g, '');
}

export function logApiRequest(endpoint: string, symbol: string, success: boolean, error?: string) {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'ERROR';
  
  console.log(`[${timestamp}] ${status} - ${endpoint} - Symbol: ${symbol}${error ? ` - Error: ${error}` : ''}`);
}
