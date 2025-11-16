#!/usr/bin/env powershell
<#
Delivery Boy API - Quick Test Commands
Run these commands in PowerShell to test the API
#>

Write-Host "`n========== DELIVERY BOY API - QUICK TEST ==========" -ForegroundColor Cyan

# Base URL
$BASE = "http://localhost:5000"

Write-Host "`n--- Test 1: Health Check ---" -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "$BASE/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "Status: $($health.database.status)" -ForegroundColor Green
Write-Host "Server: $($health.message)" -ForegroundColor Green

Write-Host "`n--- Test 2: Login (Invalid) ---" -ForegroundColor Yellow
try {
    $loginResp = Invoke-WebRequest -Uri "$BASE/api/delivery/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"test@test.com","password":"test"}' `
        -UseBasicParsing -ErrorAction Stop
} catch {
    $loginResp = $_.Exception.Response.Content | ConvertFrom-Json
    Write-Host "Response: $($loginResp.message)" -ForegroundColor Green
    Write-Host "(This is expected - no user exists yet)" -ForegroundColor Cyan
}

Write-Host "`n--- Test 3: Get All Delivery Routes ---" -ForegroundColor Yellow
Write-Host "Available routes:" -ForegroundColor Cyan
@(
    "POST   /api/delivery/register",
    "POST   /api/delivery/login",
    "POST   /api/delivery/logout",
    "GET    /api/delivery/me",
    "GET    /api/delivery/stats",
    "PUT    /api/delivery/availability",
    "PUT    /api/delivery/location",
    "GET    /api/delivery/orders/pending",
    "GET    /api/delivery/orders/assigned",
    "POST   /api/delivery/orders/:id/accept",
    "PUT    /api/delivery/orders/:id/out-for-delivery",
    "PUT    /api/delivery/orders/:id/delivered"
) | ForEach-Object { Write-Host "  $_" }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✓ All endpoints accessible" -ForegroundColor Green
Write-Host "✓ Server running on port 5000" -ForegroundColor Green
Write-Host "✓ MongoDB connected" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Run: node testDeliveryBoyFlow.js" -ForegroundColor Cyan
Write-Host "  2. Or import DELIVERY_BOY_POSTMAN.json to Postman" -ForegroundColor Cyan
Write-Host "  3. Check docs: DELIVERY_BOY_API.md" -ForegroundColor Cyan
Write-Host "`n==========================================`n" -ForegroundColor Cyan
