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
- Vercel account (for deployment)

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

## 🚀 Vercel Deployment

### Quick Deploy (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add the required environment variables (see below)

### GitHub Integration (Automatic Deployments)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Automatic Deployments**
   - Every push to main branch triggers automatic deployment
   - Preview deployments for pull requests
   - Automatic rollback on failed deployments

### Environment Variables for Vercel

Set these in your Vercel project dashboard:

#### Required Variables
```env
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-server.com

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-vercel-domain.vercel.app/api
NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE=50

# Production Configuration
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_DEBUG_MODE=false
```

#### Optional Variables
```env
# External Finance APIs (for production)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
YAHOO_FINANCE_API_KEY=your_yahoo_finance_api_key

# Analytics and Monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

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

### Vercel Deployment
```bash
# Deploy to Vercel production
npm run vercel:deploy

# Start Vercel development environment
npm run vercel:dev

# Build for Vercel
npm run vercel:build
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

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   # Deploy to production
   npm run vercel:deploy
   
   # Or use Vercel CLI directly
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings in Vercel
   - Add the required environment variables from `.env.example`
   - Ensure `NEXT_PUBLIC_WEBSOCKET_URL` is set for real-time features

4. **Automatic deployments**
   - Connect your GitHub repository to Vercel
   - Every push to main branch will trigger automatic deployment
   - Preview deployments are created for pull requests

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### WebSocket Configuration
```typescript
const wsConfig = {
  url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  reconnectAttempts: 5,
  reconnectInterval: 1000,
  heartbeatInterval: 30000,
  fallbackToPolling: true,
};
```

### API Rate Limiting
```typescript
const rateLimitConfig = {
  requestsPerMinute: 50,
  burstLimit: 10,
  windowMs: 60000,
};
```

### Caching Configuration
```typescript
const cacheConfig = {
  ttl: 60000, // 60 seconds
  maxSize: 1000,
  cleanupInterval: 300000, // 5 minutes
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. WebSocket Connection Failures
**Problem**: WebSocket connection fails to establish
**Solution**: 
- Check `NEXT_PUBLIC_WEBSOCKET_URL` in environment variables
- Verify WebSocket server is running and accessible
- Check browser console for connection errors
- Application will automatically fall back to polling

#### 2. API Rate Limiting
**Problem**: "Too many requests" errors
**Solution**:
- Increase `NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE` in environment variables
- Implement proper caching strategies
- Use batch requests when possible

#### 3. Unofficial Finance API Issues
**Problem**: Finance APIs return errors or no data
**Solution**:
- The application uses mock data by default
- For production, configure real API keys
- Implement proper error handling and fallbacks
- Consider using multiple data sources

#### 4. Build Errors
**Problem**: TypeScript compilation fails
**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run type-check
```

#### 5. Performance Issues
**Problem**: Slow loading or poor performance
**Solution**:
- Enable production mode: `NODE_ENV=production`
- Optimize bundle size: `npm run build:analyze`
- Implement proper caching strategies
- Use React.memo for expensive components

#### 6. Vercel Deployment Issues
**Problem**: Build fails on Vercel
**Solution**:
- Check environment variables in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors
- Verify TypeScript compilation passes locally

### Debug Mode

Enable debug mode to get detailed logging:

```bash
# Set environment variable
NEXT_PUBLIC_DEBUG_MODE=true

# Or run with debug flag
npm run dev:debug
```

## 📊 Performance Monitoring

### Bundle Analysis
```bash
npm run build:analyze
```

### Lighthouse Audit
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Use environment variables for all API keys
3. **Rate Limiting**: Implement proper rate limiting for all API endpoints
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Use HTTPS in production (automatic with Vercel)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [React Table](https://tanstack.com/table/v8) - Table library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Note**: This application uses mock data for demonstration purposes. For production use, configure real financial data APIs and ensure compliance with relevant regulations.





