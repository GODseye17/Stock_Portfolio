#!/bin/bash

# Portfolio Dashboard Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e

echo "🚀 Starting Portfolio Dashboard deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    print_success "Vercel CLI installed successfully"
else
    print_success "Vercel CLI is already installed"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Run type check
print_status "Running TypeScript type check..."
npm run type-check

# Run linting
print_status "Running ESLint..."
npm run lint

# Build the project
print_status "Building the project..."
npm run build

print_success "Build completed successfully!"

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You are not logged in to Vercel. Please log in first."
    vercel login
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

print_success "Deployment completed!"
print_status "Next steps:"
echo "1. Set up environment variables in your Vercel dashboard"
echo "2. Configure your custom domain (optional)"
echo "3. Test your deployed application"
echo ""
print_status "Required environment variables:"
echo "- NEXT_PUBLIC_WEBSOCKET_URL"
echo "- NEXT_PUBLIC_API_BASE_URL"
echo "- NEXT_PUBLIC_RATE_LIMIT_PER_MINUTE"
echo "- NEXT_PUBLIC_ENABLE_MOCK_DATA"
echo "- NEXT_PUBLIC_DEBUG_MODE"
echo ""
print_status "See DEPLOYMENT.md for detailed instructions."
