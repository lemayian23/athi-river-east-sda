# test-sermon.ps1
Write-Host "🧪 Testing Sermons API" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# 1. Login to get token
Write-Host "`n[1] Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{ username = "admin"; password = "Admin123!" } | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    Write-Host "✅ Login successful. Token received." -ForegroundColor Green

    # 2. Create a test sermon
    Write-Host "`n[2] Creating a test sermon..." -ForegroundColor Yellow
    $sermonBody = @{
        title = "Test Sermon from PowerShell"
        speaker = "Pastor Test"
        scripture = "John 3:16"
        description = "This is an automated test sermon created by the test script."
        date = (Get-Date -Format "yyyy-MM-dd")
        duration = 1800
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/sermons" `
        -Method Post `
        -Headers $headers `
        -Body $sermonBody

    Write-Host "✅ Sermon created! ID: $($createResponse.id)" -ForegroundColor Green

    # 3. Fetch all sermons (public endpoint, no token needed)
    Write-Host "`n[3] Fetching all sermons (public)..." -ForegroundColor Yellow
    $sermons = Invoke-RestMethod -Uri "http://localhost:3000/api/sermons" -Method Get

    Write-Host "✅ Found $($sermons.Count) sermon(s) in the database." -ForegroundColor Green
    Write-Host "`n📋 Latest Sermons:" -ForegroundColor Cyan
    $sermons | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.title) by $($_.speaker) on $($_.date)" -ForegroundColor White
    }

    Write-Host "`n🎉 All tests passed! API is working perfectly." -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}