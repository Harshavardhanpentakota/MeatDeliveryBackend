# Generate secure JWT secret for production
Write-Host "🔐 Generating secure JWT secret for your Meat Delivery Backend..." -ForegroundColor Cyan
Write-Host ""

# Generate a secure random JWT secret
$jwtSecret = -join ((1..64) | ForEach {Get-Random -input ([char[]]([char]'A'..[char]'Z' + [char]'a'..[char]'z' + [char]'0'..[char]'9'))})

Write-Host "✅ Your secure JWT secret (copy this for Vercel):" -ForegroundColor Green
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host ""

# Also generate a MongoDB Atlas connection string template
Write-Host "🔗 MongoDB Atlas connection string template:" -ForegroundColor Cyan
Write-Host "MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/meat-delivery?retryWrites=true&w=majority" -ForegroundColor Yellow
Write-Host ""
Write-Host "Replace USERNAME and PASSWORD with your Atlas credentials" -ForegroundColor Gray
Write-Host ""

# Show all required environment variables
Write-Host "📝 Complete environment variables for Vercel:" -ForegroundColor Magenta
Write-Host "MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/meat-delivery?retryWrites=true&w=majority" -ForegroundColor White
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "JWT_EXPIRE=7d" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "CORS_ORIGINS=https://your-frontend-domain.com" -ForegroundColor White
Write-Host ""

Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up MongoDB Atlas (see DEPLOYMENT_CHECKLIST.md)" -ForegroundColor White
Write-Host "2. Add these environment variables to Vercel" -ForegroundColor White
Write-Host "3. Update CORS_ORIGINS with your actual domain" -ForegroundColor White
Write-Host "4. Deploy to Vercel!" -ForegroundColor White