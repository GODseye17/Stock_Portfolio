import { NextRequest, NextResponse } from "next/server";
import { GoogleFinanceQuote, ApiResponse } from "@/types/portfolio";

const cache = new Map<string, { data: any; timestamp: number }>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const CACHE_DURATION = 5 * 60 * 1000;
const RATE_LIMIT = 50;
const RATE_LIMIT_WINDOW = 60 * 1000;

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || 
         request.headers.get("x-real-ip") || 
         "unknown";
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
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

async function fetchPolygonData(symbol: string): Promise<GoogleFinanceQuote> {
  try {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error("Polygon API key not configured");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error("No data available for symbol");
    }
    
    const quote = data.results[0];
    const open = quote.o;
    const close = quote.c;
    const change = close - open;
    const changePercent = (change / open) * 100;
    
    return {
      ticker: symbol,
      price: close,
      change: change,
      changePercent: changePercent,
      volume: quote.v,
      marketCap: 0,
      peRatio: null,
      eps: null,
      dividendYield: null,
      sector: "Unknown",
      exchange: "Unknown",
      currency: "USD",
    };
  } catch (error) {
    console.error(`Error fetching Polygon data for ${symbol}:`, error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function fetchIEXData(symbol: string): Promise<GoogleFinanceQuote> {
  try {
    const apiKey = process.env.IEX_API_KEY;
    if (!apiKey) {
      throw new Error("IEX API key not configured");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${apiKey}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ticker: symbol,
      price: data.latestPrice,
      change: data.change,
      changePercent: data.changePercent * 100,
      volume: data.latestVolume,
      marketCap: data.marketCap || 0,
      peRatio: data.peRatio,
      eps: data.eps,
      dividendYield: data.ytdChange ? data.ytdChange * 100 : null,
      sector: data.sector || "Unknown",
      exchange: data.primaryExchange || "Unknown",
      currency: "USD",
    };
  } catch (error) {
    console.error(`Error fetching IEX data for ${symbol}:`, error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const cacheKey = `google_${symbolUpper}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        error: null,
        timestamp: new Date().toISOString(),
      });
    }

    let data: GoogleFinanceQuote;
    try {
      data = await retryOperation(() => fetchPolygonData(symbolUpper));
    } catch (error) {
      console.log(`Polygon failed for ${symbolUpper}, trying IEX...`);
      try {
        data = await retryOperation(() => fetchIEXData(symbolUpper));
      } catch (iexError) {
        throw new Error(`Both Polygon and IEX failed for ${symbolUpper}`);
      }
    }
    
    setCachedData(cacheKey, data);

    const response: ApiResponse<GoogleFinanceQuote> = {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Google Finance API Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage, data: null, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
