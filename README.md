# Portfolio Dashboard - Real-Time Stock Management

A modern, real-time portfolio dashboard built with Next.js 15, TypeScript, and Tailwind CSS. Features comprehensive error handling, WebSocket connections for live price updates, and a professional financial application interface.

## 🚀 Features

- **Real-Time Price Updates**: WebSocket connections with polling fallback
- **Comprehensive Error Handling**: Retry mechanisms, exponential backoff, and graceful degradation
- **Modern UI/UX**: Dark mode support, smooth animations, and responsive design
- **Advanced Data Management**: Optimized caching, batch fetching, and change detection
- **Professional Charts**: Interactive charts using Recharts for portfolio analysis
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Performance Optimized**: Memoization, virtualization, and minimal re-renders

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment variables** (see [Environment Variables](#environment-variables) section)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables
```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.com

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE=50

# Optional: External Finance APIs (for production)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
YAHOO_FINANCE_API_KEY=your_yahoo_finance_api_key
```

### Optional Variables
```env
# Development Configuration
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_DEBUG_MODE=false

# Production Configuration
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 📦 Available Scripts

### Development
```bash
# Start development server with Turbopack
npm run dev

# Start development server without Turbopack
npm run dev:legacy

# Start development server with debugging
npm run dev:debug
```

### Building
```bash
# Build for production
npm run build

# Build with bundle analysis
npm run build:analyze

# Type check without building
npm run type-check
```

### Production
```bash
# Start production server
npm start

# Start production server with custom port
npm run start:prod
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint:fix

# Run Prettier
npm run format

# Check Prettier formatting
npm run format:check
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── yahoo-finance/ # Yahoo Finance API
│   │   ├── google-finance/ # Google Finance API
│   │   └── websocket/     # WebSocket endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── PortfolioManager.tsx
│   ├── PortfolioTable.tsx
│   ├── RealTimeIndicator.tsx
│   ├── ConnectionStatus.tsx
│   ├── FallbackUI.tsx
│   ├── Toast.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   └── usePortfolio.ts
├── lib/                   # Utility libraries
│   ├── websocketService.ts
│   ├── errorHandling.ts
│   ├── optimizedStockDataService.ts
│   └── api-utils.ts
├── types/                 # TypeScript type definitions
│   └── portfolio.ts
├── data/                  # Static data
│   └── initialPortfolio.ts
└── contexts/              # React contexts
    └── ThemeContext.tsx
```

## 🔌 API Configuration

### Yahoo Finance API
The application includes a mock Yahoo Finance API endpoint that simulates real market data:

```typescript
// Endpoint: /api/yahoo-finance/[symbol]
// Method: GET
// Response: YahooFinanceQuote
```

### Google Finance API
Similar mock implementation for Google Finance:

```typescript
// Endpoint: /api/google-finance/[symbol]
// Method: GET
// Response: GoogleFinanceQuote
```

### WebSocket Service
Real-time price updates via WebSocket:

```typescript
// Connection: wss://your-websocket-server.com
// Message Types: price_update, heartbeat, subscribe, unsubscribe
```





