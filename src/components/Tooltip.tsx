'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top',
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`
          absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 
          rounded-lg shadow-lg max-w-xs ${positionClasses[position]}
          transition-all duration-200 ease-in-out
        `}>
          {content}
          <div className={`
            absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45
            ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
            ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
            ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
          `} />
        </div>
      )}
    </div>
  );
}

export function PERatioTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip
      content={
        <div>
          <p className="font-semibold mb-1">P/E Ratio (Price-to-Earnings)</p>
          <p className="text-xs text-gray-300">
            Measures a company's stock price relative to its earnings per share. 
            Lower ratios may indicate undervalued stocks, while higher ratios 
            suggest growth expectations.
          </p>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}

export function EarningsTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip
      content={
        <div>
          <p className="font-semibold mb-1">Latest Earnings</p>
          <p className="text-xs text-gray-300">
            The most recent earnings per share (EPS) reported by the company. 
            Higher earnings typically indicate better financial performance 
            and potential for stock price appreciation.
          </p>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}

export function MarketCapTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip
      content={
        <div>
          <p className="font-semibold mb-1">Market Capitalization</p>
          <p className="text-xs text-gray-300">
            Total value of a company's shares. Calculated by multiplying 
            current stock price by total number of outstanding shares. 
            Indicates company size and market value.
          </p>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
