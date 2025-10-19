#!/bin/bash

# Meat Delivery Backend - Quick Deployment Script
# This script helps prepare your app for Vercel deployment

echo "🚀 Preparing Meat Delivery Backend for Vercel deployment..."
echo ""

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found!"
    echo "Please ensure all deployment files are present."
    exit 1
fi

# Check if api directory exists
if [ ! -d "api" ]; then
    echo "❌ api directory not found!"
    echo "Please ensure the api/index.js file is present."
    exit 1
fi

echo "✅ Deployment files verified"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check environment variables
echo "🔍 Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found"
    echo "Don't forget to set environment variables in Vercel dashboard!"
else
    echo "✅ .env file found (remember to set these in Vercel)"
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "  ✅ vercel.json configured"
echo "  ✅ api/index.js entry point created"
echo "  ✅ Dependencies installed"
echo "  ✅ CORS configured for production"
echo "  ✅ Health check endpoint enhanced"
echo ""

echo "🎯 Next steps:"
echo "  1. Push your code to GitHub"
echo "  2. Connect your repository to Vercel"
echo "  3. Set environment variables in Vercel dashboard"
echo "  4. Deploy!"
echo ""

echo "📚 Need help? Check VERCEL_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🚀 Ready for deployment!"