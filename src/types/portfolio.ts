export interface Stock {
  id: string;
  particulars: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: string;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  peRatio: number | null;
  latestEarnings: number | null;
  sector: string;
}

export interface Sector {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  percentageOfPortfolio: number;
  stockCount: number;
  averagePeRatio: number | null;
  stocks: Stock[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  totalStocks: number;
  totalSectors: number;
  bestPerformingStock: Stock | null;
  worstPerformingStock: Stock | null;
  bestPerformingSector: Sector | null;
  worstPerformingSector: Sector | null;
}

export interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
}

export interface YahooFinanceResponse {
  quoteResponse: {
    result: YahooFinanceQuote[];
    error: string | null;
  };
}

export interface GoogleFinanceQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  sector: string;
  exchange: string;
  currency: string;
}

export interface GoogleFinanceResponse {
  data: GoogleFinanceQuote[];
  error: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  error: string | null;
  timestamp: string;
}

export interface PortfolioApiResponse extends ApiResponse<PortfolioSummary> {
  stocks: Stock[];
  sectors: Sector[];
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currency: string;
}

export interface StockLookupResponse extends ApiResponse<StockSearchResult[]> {
  query: string;
  totalResults: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockHistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  addedAt: string;
  targetPrice: number | null;
  notes: string | null;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt: string | null;
}


