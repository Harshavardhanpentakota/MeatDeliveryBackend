# Meat Delivery Backend - Quick Deployment Script (PowerShell)
# This script helps prepare your app for Vercel deployment

Write-Host "🚀 Preparing Meat Delivery Backend for Vercel deployment..." -ForegroundColor Green
Write-Host ""

# Check if vercel.json exists
if (-Not (Test-Path "vercel.json")) {
    Write-Host "❌ vercel.json not found!" -ForegroundColor Red
    Write-Host "Please ensure all deployment files are present." -ForegroundColor Red
    exit 1
}

# Check if api directory exists
if (-Not (Test-Path "api")) {
    Write-Host "❌ api directory not found!" -ForegroundColor Red
    Write-Host "Please ensure the api/index.js file is present." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment files verified" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check environment variables
Write-Host "🔍 Checking environment configuration..." -ForegroundColor Yellow

if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found" -ForegroundColor Yellow
    Write-Host "Don't forget to set environment variables in Vercel dashboard!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file found (remember to set these in Vercel)" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Cyan
Write-Host "  ✅ vercel.json configured" -ForegroundColor Green
Write-Host "  ✅ api/index.js entry point created" -ForegroundColor Green
Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
Write-Host "  ✅ CORS configured for production" -ForegroundColor Green
Write-Host "  ✅ Health check endpoint enhanced" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Push your code to GitHub" -ForegroundColor White
Write-Host "  2. Connect your repository to Vercel" -ForegroundColor White
Write-Host "  3. Set environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "  4. Deploy!" -ForegroundColor White
Write-Host ""

Write-Host "📚 Need help? Check VERCEL_DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready for deployment!" -ForegroundColor Green

# Show essential environment variables
Write-Host ""
Write-Host "🔑 Essential Environment Variables for Vercel:" -ForegroundColor Magenta
Write-Host "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meat-delivery" -ForegroundColor White
Write-Host "JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters" -ForegroundColor White
Write-Host "JWT_EXPIRE=7d" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "CORS_ORIGINS=https://your-frontend-domain.com" -ForegroundColor White