#!/bin/bash

# 🚀 Ghanshyam Murti Bhandar Admin Panel - Deployment Script
# This script deploys the admin panel to Vercel with production configuration

echo "🚀 Starting deployment of Ghanshyam Murti Bhandar Admin Panel..."
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is already installed"
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "🔑 Please login to Vercel..."
    vercel login
else
    echo "✅ Already logged in to Vercel"
fi

# Set production environment
echo "🔧 Setting up production environment..."
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️  Building the project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "=================================================="
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure custom domain: admin.ghanshyammurtibhandar.com"
echo "2. Test admin login with: admin@ghanshyambhandar.com"
echo "3. Verify backend connectivity"
echo ""
echo "🔗 Backend API: https://server.ghanshyammurtibhandar.com/api"
echo "📚 API Docs: https://server.ghanshyammurtibhandar.com/api/docs"
echo ""
echo "✨ Your admin panel is now live and ready to manage your ecommerce platform!"
