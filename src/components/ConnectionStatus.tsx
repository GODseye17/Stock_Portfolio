'use client';

import React, { useEffect, useState } from 'react';
import { ConnectionMonitor, ConnectionStatus } from '@/lib/errorHandling';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: true,
    lastCheck: new Date(),
    apiHealth: { yahoo: true, google: true },
    retryCount: 0,
  });

  useEffect(() => {
    const monitor = ConnectionMonitor.getInstance();
    const unsubscribe = monitor.subscribe(setStatus);
    
    monitor.startHealthCheck(30000);
    
    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'text-red-500';
    if (!status.apiHealth.yahoo || !status.apiHealth.google) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (!status.apiHealth.yahoo && !status.apiHealth.google) return 'All APIs Down';
    if (!status.apiHealth.yahoo || !status.apiHealth.google) return 'Partial API Issues';
    return 'All Systems Operational';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922a1 1 0 01-.648 1.353l-1.958.383a1 1 0 00-.796 1.037v1.263a1 1 0 001.414.914l1.263-.691a1 1 0 01.796 0l1.263.691a1 1 0 001.414-.914v-1.263a1 1 0 00-.796-1.037l-1.958-.383a1 1 0 01-.648-1.353l6.921-6.922a1 1 0 00-1.414-1.414l-6.921 6.922z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (!status.apiHealth.yahoo && !status.apiHealth.google) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (!status.apiHealth.yahoo || !status.apiHealth.google) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      
      {status.retryCount > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          (Retry: {status.retryCount})
        </span>
      )}
      
      <div className="flex space-x-1">
        <div className={`w-2 h-2 rounded-full ${status.apiHealth.yahoo ? 'bg-green-500' : 'bg-red-500'}`} title="Yahoo Finance API" />
        <div className={`w-2 h-2 rounded-full ${status.apiHealth.google ? 'bg-green-500' : 'bg-red-500'}`} title="Google Finance API" />
      </div>
    </div>
  );
}
