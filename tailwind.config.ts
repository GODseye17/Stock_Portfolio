import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'spin': 'spin 1s linear infinite',
        'value-change': 'valueChange 0.3s ease-in-out',
        'gain-pulse': 'gainPulse 1s ease-in-out',
        'loss-pulse': 'lossPulse 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        valueChange: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        gainPulse: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
          '50%': { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
          '100%': { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
        },
        lossPulse: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '100%': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        },
      },
      backgroundSize: {
        'size-200': '200% 100%',
      },
    },
  },
  plugins: [],
};

export default config;
