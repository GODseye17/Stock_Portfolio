import { NextRequest, NextResponse } from "next/server";

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface BatchPriceResponse {
  success: boolean;
  data: StockPrice[];
  error: string | null;
  timestamp: string;
}

async function fetchYahooFinancePrice(symbol: string): Promise<StockPrice | null> {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return null;
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
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || quote.volume[quote.volume.length - 1] || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    return null;
  }
}

async function fetchAlphaVantagePrice(symbol: string): Promise<StockPrice | null> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return null;
    }
    
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      return null;
    }
    
    const quote = data["Global Quote"];
    
    return {
      symbol: symbol,
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { success: false, error: "Invalid symbols array", data: [], timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }
    
    const uniqueSymbols = [...new Set(symbols.map((s: string) => s.toUpperCase()))];
    const prices: StockPrice[] = [];
    
    // Fetch prices in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < uniqueSymbols.length; i += batchSize) {
      const batch = uniqueSymbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          // Try Yahoo Finance first
          let priceData = await fetchYahooFinancePrice(symbol);
          
          // Fallback to Alpha Vantage if Yahoo Finance fails
          if (!priceData) {
            priceData = await fetchAlphaVantagePrice(symbol);
          }
          
          return priceData;
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      prices.push(...batchResults.filter((result): result is StockPrice => result !== null));
      
      // Rate limiting delay between batches
      if (i + batchSize < uniqueSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const response: BatchPriceResponse = {
      success: true,
      data: prices,
      error: null,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Batch price fetch error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { success: false, error: errorMessage, data: [], timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
