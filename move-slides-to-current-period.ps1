# PowerShell script to move all carousel slides to current period and sort by island
# Change to the correct directory
Set-Location "c:\Users\sergi\Downloads\Bonairemakelaars-001\bonairemakelaars.com_8roa65"

$supabaseUrl = "http://127.0.0.1:54321"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

Write-Host "Moving all carousel slides to current period (Period 1) and organizing by island..." -ForegroundColor Yellow

try {
    # First, get all current carousel slides
    Write-Host "`n=== FETCHING CURRENT CAROUSEL SLIDES ===" -ForegroundColor Cyan
    $carouselResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/carousel_slides?select=*" -Headers @{
        "apikey" = $serviceKey
        "Authorization" = "Bearer $serviceKey"
    } -Method GET
    
    Write-Host "Total carousel slides found: $($carouselResponse.Count)" -ForegroundColor Green
    
    if ($carouselResponse.Count -gt 0) {
        # Show current distribution
        Write-Host "`nCurrent distribution:" -ForegroundColor Yellow
        Write-Host "By island:" -ForegroundColor Gray
        $carouselResponse | Group-Object island | ForEach-Object { 
            Write-Host "  $($_.Name): $($_.Count) slides" -ForegroundColor White
        }
        
        Write-Host "`nBy period:" -ForegroundColor Gray
        $carouselResponse | Group-Object period_number | ForEach-Object { 
            $periodName = if ($_.Name -eq "") { "No period" } else { "Period $($_.Name)" }
            Write-Host "  ${periodName}: $($_.Count) slides" -ForegroundColor White
        }
        
        # Sort slides by island (bonaire, aruba, curacao) and assign sort_order
        $sortedSlides = $carouselResponse | Sort-Object @{Expression={
            switch ($_.island) {
                'bonaire' { 1 }
                'aruba' { 2 }
                'curacao' { 3 }
                default { 4 }
            }
        }}, sort_order
        
        Write-Host "`n=== UPDATING SLIDES TO CURRENT PERIOD ===" -ForegroundColor Cyan
        $currentSortOrder = 0
        $updateCount = 0
        
        foreach ($slide in $sortedSlides) {
            $currentSortOrder++
            
            # Prepare update data
            $updateData = @{
                period_number = 1
                year = 2025
                sort_order = $currentSortOrder
            } | ConvertTo-Json
            
            try {
                # Update the slide
                $updateResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/carousel_slides?id=eq.$($slide.id)" -Headers @{
                    "apikey" = $serviceKey
                    "Authorization" = "Bearer $serviceKey"
                    "Content-Type" = "application/json"
                    "Prefer" = "return=minimal"
                } -Method PATCH -Body $updateData
                
                Write-Host "✅ Updated slide '$($slide.title)' [$($slide.island)] - Sort order: $currentSortOrder" -ForegroundColor Green
                $updateCount++
                
            } catch {
                Write-Host "❌ Failed to update slide '$($slide.title)': $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
        Write-Host "Successfully updated $updateCount out of $($carouselResponse.Count) slides" -ForegroundColor Green
        Write-Host "All slides are now in Period 1 (June 30 - July 27, 2025)" -ForegroundColor Green
        Write-Host "Sort order: Bonaire (1-$($($sortedSlides | Where-Object {$_.island -eq 'bonaire'}).Count)), Aruba ($($($sortedSlides | Where-Object {$_.island -eq 'bonaire'}).Count + 1)-$($($sortedSlides | Where-Object {$_.island -eq 'bonaire'}).Count + ($sortedSlides | Where-Object {$_.island -eq 'aruba'}).Count)), Curacao ($($($sortedSlides | Where-Object {$_.island -eq 'bonaire'}).Count + ($sortedSlides | Where-Object {$_.island -eq 'aruba'}).Count + 1)-$($sortedSlides.Count))" -ForegroundColor Green
        
        # Verify the changes
        Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
        $verifyResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/carousel_slides?select=*&order=sort_order.asc" -Headers @{
            "apikey" = $serviceKey
            "Authorization" = "Bearer $serviceKey"
        } -Method GET
        
        Write-Host "Updated distribution:" -ForegroundColor Yellow
        Write-Host "By island:" -ForegroundColor Gray
        $verifyResponse | Group-Object island | ForEach-Object { 
            Write-Host "  $($_.Name): $($_.Count) slides" -ForegroundColor White
        }
        
        Write-Host "`nBy period:" -ForegroundColor Gray
        $verifyResponse | Group-Object period_number | ForEach-Object { 
            $periodName = if ($_.Name -eq "") { "No period" } else { "Period $($_.Name)" }
            Write-Host "  ${periodName}: $($_.Count) slides" -ForegroundColor White
        }
        
    } else {
        Write-Host "No carousel slides found to update" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error:" -ForegroundColor Red
    $_.Exception
}
