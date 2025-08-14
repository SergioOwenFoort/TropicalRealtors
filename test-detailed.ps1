# Enhanced PowerShell script to test Supabase connection with different approaches
# Change to the correct directory
Set-Location "c:\Users\sergi\Downloads\Bonairemakelaars-001\bonairemakelaars.com_8roa65"

$supabaseUrl = "http://127.0.0.1:54321"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

Write-Host "Testing Supabase connection with detailed analysis..." -ForegroundColor Yellow

try {
    # Test properties table with count
    Write-Host "`n=== PROPERTIES TABLE ===" -ForegroundColor Cyan
    $propertiesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/properties?select=*" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Properties table accessible" -ForegroundColor Green
    Write-Host "Total properties found: $($propertiesResponse.Count)" -ForegroundColor Cyan
    
    if ($propertiesResponse.Count -gt 0) {
        $featuredCount = ($propertiesResponse | Where-Object { $_.featured -eq $true }).Count
        Write-Host "Featured properties (uitgelichte woningen): $featuredCount" -ForegroundColor Cyan
        Write-Host "Property statuses:" -ForegroundColor Yellow
        $propertiesResponse | Group-Object status | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
        
        # Show island distribution
        Write-Host "Properties by island:" -ForegroundColor Yellow
        $propertiesResponse | Group-Object island | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
    }
    
    # Test realtors table with count
    Write-Host "`n=== REALTORS TABLE ===" -ForegroundColor Cyan
    $realtorsResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/realtors?select=*" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Realtors table accessible" -ForegroundColor Green
    Write-Host "Total realtors found: $($realtorsResponse.Count)" -ForegroundColor Cyan
    
    if ($realtorsResponse.Count -gt 0) {
        Write-Host "Realtors by island:" -ForegroundColor Yellow
        $realtorsResponse | Group-Object island | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
        
        Write-Host "First few realtors with image URLs:" -ForegroundColor Yellow
        $realtorsResponse | Select-Object -First 3 | ForEach-Object { 
            Write-Host "  - $($_.name) ($($_.email)) - Island: $($_.island)" 
            Write-Host "    Image URL: $($_.image_url)" -ForegroundColor Gray
        }
        
        # Test image URL accessibility
        Write-Host "`nTesting image URL accessibility:" -ForegroundColor Yellow
        $firstRealtorWithImage = $realtorsResponse | Where-Object { $_.image_url -and $_.image_url -ne "" } | Select-Object -First 1
        if ($firstRealtorWithImage) {
            try {
                Write-Host "Testing URL: $($firstRealtorWithImage.image_url)" -ForegroundColor Cyan
                $imageTest = Invoke-WebRequest -Uri $firstRealtorWithImage.image_url -Method Head -TimeoutSec 10
                Write-Host "✅ Image URL accessible - Status: $($imageTest.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Image URL not accessible: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "No realtors with valid image URLs found" -ForegroundColor Yellow
        }
    }
    
    # Test profiles table with count
    Write-Host "`n=== PROFILES TABLE ===" -ForegroundColor Cyan
    $profilesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?select=*" -Headers @{
        "apikey" = $apiKey
        "Authorization" = "Bearer $apiKey"
    } -Method GET
    
    Write-Host "✅ Profiles table accessible" -ForegroundColor Green
    Write-Host "Total profiles found: $($profilesResponse.Count)" -ForegroundColor Cyan
    
    if ($profilesResponse.Count -gt 0) {
        Write-Host "Profile roles:" -ForegroundColor Yellow
        $profilesResponse | Group-Object role | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
        
        # Check for admin accounts
        $adminAccounts = $profilesResponse | Where-Object { $_.role -eq "admin" }
        if ($adminAccounts.Count -gt 0) {
            Write-Host "Admin accounts found:" -ForegroundColor Green
            $adminAccounts | ForEach-Object { Write-Host "  - $($_.email)" -ForegroundColor Cyan }
        } else {
            Write-Host "No admin accounts found" -ForegroundColor Red
        }
        
        # Show all profiles with their roles
        Write-Host "All profiles:" -ForegroundColor Yellow
        $profilesResponse | ForEach-Object { 
            $roleColor = if ($_.role -eq "admin") { "Green" } else { "Gray" }
            Write-Host "  - $($_.email) [$($_.role)]" -ForegroundColor $roleColor
        }
    }
    
    # Test carousel_slides table
    Write-Host "`n=== CAROUSEL SLIDES TABLE ===" -ForegroundColor Cyan
    try {
        $carouselResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/carousel_slides?select=*" -Headers @{
            "apikey" = $apiKey
            "Authorization" = "Bearer $apiKey"
        } -Method GET
        
        Write-Host "✅ Carousel slides table accessible" -ForegroundColor Green
        Write-Host "Total carousel slides found: $($carouselResponse.Count)" -ForegroundColor Cyan
        
        if ($carouselResponse.Count -gt 0) {
            Write-Host "Carousel slides by island:" -ForegroundColor Yellow
            $carouselResponse | Group-Object island | ForEach-Object { Write-Host "  $($_.Name): $($_.Count)" }
        }
    } catch {
        Write-Host "❌ Carousel slides table error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test with RLS bypass (service_role key)
    Write-Host "`n=== TESTING WITH SERVICE ROLE (RLS BYPASS) ===" -ForegroundColor Magenta
    $serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    
    try {
        $serviceRealtorsResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/realtors?select=*" -Headers @{
            "apikey" = $serviceKey
            "Authorization" = "Bearer $serviceKey"
        } -Method GET
        
        Write-Host "With service role - Total realtors: $($serviceRealtorsResponse.Count)" -ForegroundColor Green
        
        $servicePropertiesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/properties?select=*" -Headers @{
            "apikey" = $serviceKey
            "Authorization" = "Bearer $serviceKey"
        } -Method GET
        
        Write-Host "With service role - Total properties: $($servicePropertiesResponse.Count)" -ForegroundColor Green
        
    } catch {
        Write-Host "Service role test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error:" -ForegroundColor Red
    $_.Exception
}
