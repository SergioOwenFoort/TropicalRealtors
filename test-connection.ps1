# PowerShell script to test Supabase connection
$supabaseUrl = "http://127.0.0.1:54321"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

Write-Host "Testing Supabase connection..." -ForegroundColor Yellow

try {
    # Test basic health endpoint
    $healthResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Supabase API is accessible" -ForegroundColor Green
    
    # Test properties table
    $propertiesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/properties?select=*&limit=5" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Properties table accessible" -ForegroundColor Green
    Write-Host "Found $($propertiesResponse.Count) properties" -ForegroundColor Cyan
    
    if ($propertiesResponse.Count -gt 0) {
        Write-Host "Sample property:" -ForegroundColor Cyan
        $propertiesResponse[0] | ConvertTo-Json -Depth 2
        
        $featuredCount = ($propertiesResponse | Where-Object { $_.featured -eq $true }).Count
        Write-Host "Featured properties: $featuredCount" -ForegroundColor Cyan
    }
    
    # Test profiles table
    $profilesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?select=*&limit=3" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Profiles table accessible" -ForegroundColor Green
    Write-Host "Found $($profilesResponse.Count) profiles" -ForegroundColor Cyan
    
    # Test realtors table
    $realtorsResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/realtors?select=*&limit=3" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Realtors table accessible" -ForegroundColor Green
    Write-Host "Found $($realtorsResponse.Count) realtors" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error:" -ForegroundColor Red
    $_.Exception | ConvertTo-Json -Depth 3
}
