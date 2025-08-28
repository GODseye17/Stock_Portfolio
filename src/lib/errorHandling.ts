export interface ApiError {
  message: string;
  code: string;
  status?: number;
  retryable: boolean;
  timestamp: Date;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export class ApiErrorHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  };

  static categorizeError(error: any): ApiError {
          if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          message: 'Network connection failed. Please check your internet connection.',
          code: 'NETWORK_ERROR',
          retryable: true,
          timestamp: new Date(),
        };
      }

              if (error.message.includes('timeout')) {
        return {
          message: 'Request timed out. Please try again.',
          code: 'TIMEOUT_ERROR',
          retryable: true,
          timestamp: new Date(),
        };
      }

              if (error.message.includes('429') || error.message.includes('rate limit')) {
        return {
          message: 'Too many requests. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_ERROR',
          status: 429,
          retryable: true,
          timestamp: new Date(),
        };
      }

              if (error.message.includes('500') || error.message.includes('server')) {
        return {
          message: 'Server error occurred. Please try again later.',
          code: 'SERVER_ERROR',
          status: 500,
          retryable: true,
          timestamp: new Date(),
        };
      }

              return {
        message: error.message || 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR',
        retryable: false,
        timestamp: new Date(),
      };
    }

    return {
      message: String(error) || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
      retryable: false,
      timestamp: new Date(),
    };
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === finalConfig.maxAttempts) {
          throw lastError;
        }

        const categorizedError = this.categorizeError(lastError);
        if (!categorizedError.retryable) {
          throw lastError;
        }

        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );

        const jitteredDelay = finalConfig.jitter 
          ? delay + Math.random() * delay * 0.1 
          : delay;

        await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      }
    }

    throw lastError!;
  }

  static validateNumber(value: any, fallback: number = 0): number {
    if (typeof value === 'number' && isFinite(value)) {
      return value;
    }
    
    const parsed = parseFloat(value);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return fallback;
    }
    
    return parsed;
  }

  static validatePercentage(value: any, fallback: number = 0): number {
    const validated = this.validateNumber(value, fallback);
    return Math.max(-100, Math.min(100, validated));
  }

  static validateCurrency(value: any, fallback: number = 0): number {
    const validated = this.validateNumber(value, fallback);
    return Math.max(0, validated);
  }

  static calculatePercentageChange(oldValue: number, newValue: number): number {
    const old = this.validateNumber(oldValue, 0);
    const newVal = this.validateNumber(newValue, 0);
    
    if (old === 0) {
      return newVal > 0 ? 100 : 0;
    }
    
    return this.validatePercentage(((newVal - old) / old) * 100);
  }

  static calculateGainLoss(purchasePrice: number, currentPrice: number, quantity: number): number {
    const purchase = this.validateCurrency(purchasePrice);
    const current = this.validateCurrency(currentPrice);
    const qty = this.validateNumber(quantity, 0);
    
    return (current - purchase) * qty;
  }

  static calculatePortfolioPercentage(value: number, totalValue: number): number {
    const val = this.validateCurrency(value);
    const total = this.validateCurrency(totalValue);
    
    if (total === 0) return 0;
    
    return this.validatePercentage((val / total) * 100);
  }
}

export interface ConnectionStatus {
  isOnline: boolean;
  lastCheck: Date;
  apiHealth: {
    yahoo: boolean;
    google: boolean;
  };
  retryCount: number;
}

export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private status: ConnectionStatus = {
    isOnline: navigator.onLine,
    lastCheck: new Date(),
    apiHealth: {
      yahoo: true,
      google: true,
    },
    retryCount: 0,
  };

  private listeners: ((status: ConnectionStatus) => void)[] = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.updateStatus({ isOnline: true }));
    window.addEventListener('offline', () => this.updateStatus({ isOnline: false }));
  }

  private updateStatus(updates: Partial<ConnectionStatus>): void {
    this.status = { ...this.status, ...updates, lastCheck: new Date() };
    this.notifyListeners();
  }

  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public async checkApiHealth(): Promise<void> {
    try {
      const yahooResponse = await fetch('/api/yahoo-finance/TCS');
      const yahooHealthy = yahooResponse.ok;

      const googleResponse = await fetch('/api/google-finance/TCS');
      const googleHealthy = googleResponse.ok;

      this.updateStatus({
        apiHealth: {
          yahoo: yahooHealthy,
          google: googleHealthy,
        },
        retryCount: 0,
      });
    } catch (error) {
      this.updateStatus({
        apiHealth: {
          yahoo: false,
          google: false,
        },
        retryCount: this.status.retryCount + 1,
      });
    }
  }

  public subscribe(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getStatus()));
  }

  public startHealthCheck(intervalMs: number = 30000): void {
    setInterval(() => this.checkApiHealth(), intervalMs);
  }
}
