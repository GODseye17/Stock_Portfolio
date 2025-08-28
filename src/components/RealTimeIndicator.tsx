'use client';

import React, { useState, useEffect } from 'react';
import { WebSocketState } from '@/lib/websocketService';

interface RealTimeIndicatorProps {
  state: WebSocketState;
  isUpdating?: boolean;
  className?: string;
}

export default function RealTimeIndicator({ 
  state, 
  isUpdating = false, 
  className = '' 
}: RealTimeIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  const getStatusColor = () => {
    if (!state.isConnected && !state.isConnecting) return 'text-red-500';
    if (state.isConnecting) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (state.isConnecting) return 'Connecting...';
    if (state.isConnected) return 'Real-time';
    if (state.error) return 'Offline';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (state.isConnecting) {
      return (
        <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
    }

    if (state.isConnected) {
      return (
        <div className={`w-3 h-3 rounded-full ${pulse ? 'animate-pulse' : ''}`}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`flex items-center space-x-1 text-xs ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
      {state.reconnectAttempts > 0 && (
        <span className="text-gray-500 dark:text-gray-400">
          (Retry: {state.reconnectAttempts})
        </span>
      )}
    </div>
  );
}

export function LivePriceIndicator({ 
  isUpdating, 
  lastUpdate 
}: { 
  isUpdating: boolean;
  lastUpdate?: Date;
}) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className={`flex items-center space-x-1 ${isUpdating ? 'text-green-500' : 'text-gray-500'}`}>
        <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span>{isUpdating ? 'Live' : 'Static'}</span>
      </div>
      {lastUpdate && (
        <span className="text-gray-500 dark:text-gray-400">
          {timeAgo}
        </span>
      )}
    </div>
  );
}

export function PriceChangeIndicator({ 
  change, 
  changePercent, 
  className = '' 
}: { 
  change: number;
  changePercent: number;
  className?: string;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (change !== 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [change]);

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className={`text-sm font-medium ${
        isPositive ? 'text-green-600 dark:text-green-400' : 
        isNegative ? 'text-red-600 dark:text-red-400' : 
        'text-gray-600 dark:text-gray-400'
      }`}>
        {isPositive ? '+' : ''}{change.toFixed(2)}
      </span>
      <span className={`text-xs ${
        isPositive ? 'text-green-500' : 
        isNegative ? 'text-red-500' : 
        'text-gray-500'
      } ${isAnimating ? 'animate-bounce' : ''}`}>
        ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}
