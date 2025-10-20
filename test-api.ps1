# Test API endpoint
try {
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "http://192.168.1.4:5000/api/health" -Method GET
    Write-Host "Health check successful:" -ForegroundColor Green
    $health | ConvertTo-Json -Depth 3 | Write-Host
    
    Write-Host "`nTesting suggested products endpoint..." -ForegroundColor Yellow
    $suggested = Invoke-RestMethod -Uri "http://192.168.1.4:5000/api/products/suggested?limit=4" -Method GET
    Write-Host "Suggested products successful:" -ForegroundColor Green
    $suggested | ConvertTo-Json -Depth 5 | Write-Host
    
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor Red
}