import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceQuote, ApiResponse } from '@/types/portfolio';

const cache = new Map<string, { data: any; timestamp: number }>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const CACHE_DURATION = 5 * 60 * 1000;
const RATE_LIMIT = 50;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const rateLimit = rateLimitMap.get(clientIP);
  
  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (rateLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  rateLimit.count++;
  return true;
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

async function scrapeYahooFinance(symbol: string): Promise<YahooFinanceQuote> {
  try {
    const mockPrice = 100 + Math.random() * 1000;
    const mockChange = (Math.random() - 0.5) * 50;
    const mockChangePercent = (mockChange / mockPrice) * 100;
    
    return {
      symbol: symbol,
      regularMarketPrice: mockPrice,
      regularMarketChange: mockChange,
      regularMarketChangePercent: mockChangePercent,
      regularMarketVolume: Math.floor(Math.random() * 1000000),
      marketCap: mockPrice * Math.floor(Math.random() * 1000000),
      peRatio: 10 + Math.random() * 30,
      eps: mockPrice * 0.05 + Math.random() * 2,
      dividendYield: Math.random() * 5,
      sector: 'Technology',
      industry: 'Software',
      exchange: 'NSE',
      currency: 'INR',
    };
  } catch (error) {
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolUpper = symbol.toUpperCase();
    const clientIP = getClientIP(request);
    
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const cacheKey = `yahoo_${symbolUpper}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        error: null,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await retryOperation(() => scrapeYahooFinance(symbolUpper));
    
    setCachedData(cacheKey, data);

    const response: ApiResponse<YahooFinanceQuote> = {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage, data: null, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
