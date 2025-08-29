import { Stock } from '@/types/portfolio';
import { ApiErrorHandler } from './errorHandling';
import { useState, useEffect } from 'react';

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: Date;
  change: number;
  changePercent: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  fallbackToPolling: boolean;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

export type PriceUpdateCallback = (updates: PriceUpdate[]) => void;
export type ConnectionStateCallback = (state: WebSocketState) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private priceUpdateCallbacks: PriceUpdateCallback[] = [];
  private connectionStateCallbacks: ConnectionStateCallback[] = [];
  private previousPrices: Map<string, number> = new Map();
  private isPollingFallback: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private subscribedSymbols: Set<string> = new Set();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://ws.postman-echo.com/raw',
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      fallbackToPolling: true,
      ...config,
    };

    this.state = {
      isConnected: false,
      isConnecting: false,
      lastMessage: null,
      reconnectAttempts: 0,
      error: null,
    };
  }

  subscribe(callback: PriceUpdateCallback): () => void {
    this.priceUpdateCallbacks.push(callback);
    return () => {
      const index = this.priceUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.priceUpdateCallbacks.splice(index, 1);
      }
    };
  }

  subscribeToConnectionState(callback: ConnectionStateCallback): () => void {
    this.connectionStateCallbacks.push(callback);
    return () => {
      const index = this.connectionStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionStateCallbacks.splice(index, 1);
      }
    };
  }

  async connect(): Promise<void> {
    if (this.state.isConnected || this.state.isConnecting) {
      return;
    }

    try {
      this.updateState({ isConnecting: true, error: null });
      this.notifyConnectionState();

      this.ws = new WebSocket(this.config.url);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  disconnect(): void {
    this.cleanup();
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    this.notifyConnectionState();
  }

  subscribeToSymbols(symbols: string[]): void {
    symbols.forEach(symbol => this.subscribedSymbols.add(symbol));
    
    if (this.state.isConnected && this.ws) {
      this.sendMessage({
        type: 'subscribe',
        symbols: symbols,
      });
    }
  }

  unsubscribeFromSymbols(symbols: string[]): void {
    symbols.forEach(symbol => this.subscribedSymbols.delete(symbol));
    
    if (this.state.isConnected && this.ws) {
      this.sendMessage({
        type: 'unsubscribe',
        symbols: symbols,
      });
    }
  }

  getState(): WebSocketState {
    return { ...this.state };
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.handleOpen();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      this.handleClose(event);
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };
  }

  private handleOpen(): void {
    this.updateState({
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      error: null,
    });

    this.notifyConnectionState();
    this.startHeartbeat();
    this.subscribeToExistingSymbols();

    if (this.subscribedSymbols.size > 0) {
      this.sendMessage({
        type: 'subscribe',
        symbols: Array.from(this.subscribedSymbols),
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.updateState({ lastMessage: new Date() });

      if (data.type === 'price_update') {
        this.handlePriceUpdate(data.updates);
      } else if (data.type === 'heartbeat') {
        this.updateState({ lastMessage: new Date() });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    this.cleanup();
    
    const wasConnected = this.state.isConnected;
    this.updateState({
      isConnected: false,
      isConnecting: false,
    });

    if (wasConnected) {
      this.handleReconnection();
    }

    this.notifyConnectionState();
  }

  private handleError(error: Event): void {
    this.handleConnectionError(error);
  }

  private handleConnectionError(error: any): void {
    this.cleanup();
    
    const errorMessage = error instanceof Error ? error.message : 'Connection failed';
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: errorMessage,
    });

    this.notifyConnectionState();

    if (this.config.fallbackToPolling && !this.isPollingFallback) {
      this.startPollingFallback();
    } else {
      this.handleReconnection();
    }
  }

  private handleReconnection(): void {
    if (this.state.reconnectAttempts >= this.config.reconnectAttempts) {
      this.updateState({
        error: 'Max reconnection attempts reached',
      });
      this.notifyConnectionState();
      
      if (this.config.fallbackToPolling && !this.isPollingFallback) {
        this.startPollingFallback();
      }
      return;
    }

    const delay = this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.updateState({
        reconnectAttempts: this.state.reconnectAttempts + 1,
      });
      this.connect();
    }, delay);
  }

  private handlePriceUpdate(updates: any[]): void {
    const priceUpdates: PriceUpdate[] = [];
    const changedUpdates: PriceUpdate[] = [];

    updates.forEach((update) => {
      const previousPrice = this.previousPrices.get(update.symbol);
      const currentPrice = ApiErrorHandler.validateCurrency(update.price);
      
      if (previousPrice !== currentPrice) {
        const priceUpdate: PriceUpdate = {
          symbol: update.symbol,
          price: currentPrice,
          timestamp: new Date(update.timestamp || Date.now()),
          change: currentPrice - (previousPrice || currentPrice),
          changePercent: previousPrice 
            ? ApiErrorHandler.calculatePercentageChange(previousPrice, currentPrice)
            : 0,
        };

        priceUpdates.push(priceUpdate);
        changedUpdates.push(priceUpdate);
        this.previousPrices.set(update.symbol, currentPrice);
      }
    });

    if (changedUpdates.length > 0) {
      this.notifyPriceUpdates(changedUpdates);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected && this.ws) {
        this.sendMessage({ type: 'heartbeat' });
      }
    }, this.config.heartbeatInterval);
  }

  private startPollingFallback(): void {
    if (this.isPollingFallback) return;

    this.isPollingFallback = true;
    console.log('WebSocket unavailable, falling back to polling');

    this.pollingInterval = setInterval(async () => {
      if (this.subscribedSymbols.size === 0) return;

      try {
        const mockUpdates = Array.from(this.subscribedSymbols).map(symbol => ({
          symbol,
          price: 100 + Math.random() * 1000,
          timestamp: new Date(),
        }));

        this.handlePriceUpdate(mockUpdates);
      } catch (error) {
        console.error('Polling fallback error:', error);
      }
    }, 5000);
  }

  private stopPollingFallback(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPollingFallback = false;
  }

  private generateMockPrice(symbol: string): number {
    const basePrice = 100 + (symbol.charCodeAt(0) % 1000);
    const variation = (Math.random() - 0.5) * 0.02;
    return ApiErrorHandler.validateCurrency(basePrice * (1 + variation));
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private subscribeToExistingSymbols(): void {
    if (this.subscribedSymbols.size > 0) {
      this.sendMessage({
        type: 'subscribe',
        symbols: Array.from(this.subscribedSymbols),
      });
    }
  }

  private updateState(updates: Partial<WebSocketState>): void {
    this.state = { ...this.state, ...updates };
  }

  private notifyPriceUpdates(updates: PriceUpdate[]): void {
    this.priceUpdateCallbacks.forEach(callback => {
      try {
        callback(updates);
      } catch (error) {
        console.error('Error in price update callback:', error);
      }
    });
  }

  private notifyConnectionState(): void {
    this.connectionStateCallbacks.forEach(callback => {
      try {
        callback(this.getState());
      } catch (error) {
        console.error('Error in connection state callback:', error);
      }
    });
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.stopPollingFallback();
  }
}

export const websocketService = new WebSocketService();

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>(websocketService.getState());

  useEffect(() => {
    const unsubscribe = websocketService.subscribeToConnectionState(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    subscribe: (callback: PriceUpdateCallback) => websocketService.subscribe(callback),
    subscribeToSymbols: (symbols: string[]) => websocketService.subscribeToSymbols(symbols),
    unsubscribeFromSymbols: (symbols: string[]) => websocketService.unsubscribeFromSymbols(symbols),
  };
}

export function stocksToSymbols(stocks: Stock[]): string[] {
  return stocks.map(stock => stock.particulars);
}
