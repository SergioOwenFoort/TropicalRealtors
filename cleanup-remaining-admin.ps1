# PowerShell script to remove remaining admin-related scripts

$filesToRemove = @(
    # Admin JS files we missed
    "create-admin.js",
    "create-admin-user.js",
    "create-admin-final.js",
    "create-admin-access.js",
    "admin-direct-reset.js",
    "admin-account-manager.js"
)

Write-Host "Removing additional admin scripts..." -ForegroundColor Yellow

$removedCount = 0
$notFoundCount = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✅ Removed: $file" -ForegroundColor Green
        $removedCount++
    } else {
        Write-Host "⚠️ Not found: $file" -ForegroundColor DarkYellow
        $notFoundCount++
    }
}

# Let's also remove this cleanup script itself after it's done
Write-Host ""
Write-Host "Removing cleanup scripts..." -ForegroundColor Yellow

if (Test-Path "cleanup-admin-scripts.ps1") {
    Remove-Item "cleanup-admin-scripts.ps1" -Force
    Write-Host "✅ Removed: cleanup-admin-scripts.ps1" -ForegroundColor Green
    $removedCount++
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Cyan
Write-Host "Removed $removedCount files" -ForegroundColor Green
Write-Host "Not found: $notFoundCount files" -ForegroundColor DarkYellow
