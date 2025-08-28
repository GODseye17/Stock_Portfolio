# Vercel Quick Start Guide

## 🚀 Deploy in 3 Steps

### 1. Install & Login
```bash
npm i -g vercel
vercel login
```

### 2. Deploy
```bash
# Option A: Use the automated script
npm run deploy

# Option B: Manual deployment
vercel --prod
```

### 3. Set Environment Variables
In your Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_WEBSOCKET_URL=wss://ws.postman-echo.com/raw
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE=50
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
NEXT_PUBLIC_DEBUG_MODE=false
```

## 📋 Prerequisites
- Node.js 18+
- Git repository
- Vercel account

## 🔗 Useful Commands

```bash
# Deploy to production
npm run deploy

# Deploy to preview
vercel

# Start local development with Vercel
npm run vercel:dev

# Check deployment status
vercel ls
```

## 📚 Full Documentation
See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

## 🆘 Need Help?
- Check Vercel deployment logs
- Review `DEPLOYMENT.md`
- Check the main `README.md` troubleshooting section
