import { NextRequest, NextResponse } from "next/server";
import { YahooFinanceQuote, ApiResponse } from "@/types/portfolio";

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

async function fetchYahooFinanceData(symbol: string): Promise<YahooFinanceQuote> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("No data available for symbol");
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
    const previousClose = meta.previousClose || quote.close[quote.close.length - 2] || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol: symbol,
      regularMarketPrice: currentPrice,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketVolume: meta.regularMarketVolume || quote.volume[quote.volume.length - 1] || 0,
      marketCap: meta.marketCap || 0,
      peRatio: meta.trailingPE || null,
      eps: meta.epsTrailingTwelveMonths || null,
      dividendYield: meta.trailingAnnualDividendYield ? meta.trailingAnnualDividendYield * 100 : null,
      sector: meta.sector || "Unknown",
      industry: meta.industry || "Unknown",
      exchange: meta.exchangeName || "Unknown",
      currency: meta.currency || "USD",
    };
  } catch (error) {
    console.warn(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function fetchAlphaVantageData(symbol: string): Promise<YahooFinanceQuote> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error("Alpha Vantage API key not configured");
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      throw new Error("No data available for symbol");
    }
    
    const quote = data["Global Quote"];
    
    return {
      symbol: symbol,
      regularMarketPrice: parseFloat(quote["05. price"]),
      regularMarketChange: parseFloat(quote["09. change"]),
      regularMarketChangePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      regularMarketVolume: parseInt(quote["06. volume"]),
      marketCap: 0,
      peRatio: null,
      eps: null,
      dividendYield: null,
      sector: "Unknown",
      industry: "Unknown",
      exchange: quote["01. exchange"] || "Unknown",
      currency: "USD",
    };
  } catch (error) {
    console.warn(`Error fetching Alpha Vantage data for ${symbol}:`, error);
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

    let data: YahooFinanceQuote;
    try {
      data = await retryOperation(() => fetchYahooFinanceData(symbolUpper));
    } catch (error) {
      console.log(`Yahoo Finance failed for ${symbolUpper}, trying Alpha Vantage...`);
      try {
        data = await retryOperation(() => fetchAlphaVantageData(symbolUpper));
      } catch (alphaError) {
        throw new Error(`Both Yahoo Finance and Alpha Vantage failed for ${symbolUpper}`);
      }
    }
    
    setCachedData(cacheKey, data);

    const response: ApiResponse<YahooFinanceQuote> = {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage, data: null, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
