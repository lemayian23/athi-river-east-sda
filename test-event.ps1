# test-event.ps1
Write-Host "🧪 Testing Events API" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Login
$loginBody = @{ username = "admin"; password = "Admin123!" } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    Write-Host "✅ Login successful." -ForegroundColor Green

    # Create event
    $eventBody = @{
        title = "Youth Camp 2026"
        description = "Annual youth camp at Oloolua Forest"
        event_date = (Get-Date).AddDays(7).ToString("yyyy-MM-dd HH:mm:ss")
        location = "Oloolua Nature Trail, Ngong"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/events" `
        -Method Post `
        -Headers $headers `
        -Body $eventBody

    Write-Host "✅ Event created! ID: $($createResponse.id)" -ForegroundColor Green

    # Fetch all events
    $events = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method Get
    Write-Host "✅ Found $($events.Count) event(s)." -ForegroundColor Green
    $events | ForEach-Object {
        Write-Host "  - $($_.title) at $($_.location) on $($_.event_date)" -ForegroundColor White
    }

    Write-Host "`n🎉 Events API is working!" -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}