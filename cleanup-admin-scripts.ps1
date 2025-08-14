# PowerShell script to remove all admin-related and password-related scripts
# This will help clean up the project of temporary diagnostic/admin scripts

$filesToRemove = @(
    # Admin-related JavaScript files
    "update-admin-password.js",
    "set-admin-password.js",
    "reset-admin-sql.js",
    "reset-admin-pwd.js",
    "reset-admin-password.js",
    "reset-admin-direct.js",
    "reset-admin-direct-api.js",
    "reset-admin-account.js",
    "quick_admin_fix.js",
    "quick-create-admin.js",
    "get-admin-password.js",
    "force-reset-admin.js",
    "fix-admin-js.js",
    "create-new-admin.js",
    "create-admin.ps1",
    "create-admin-account.js",
    "check-admin.js",
    "check-admin-user.js",
    "check-admin-status.js",

    # SQL files
    "reset_admin_sql.sql",
    "reset_admin_password.sql",
    "fix_admin_role.sql",
    "fix-admin-accounts.sql",
    "create_admin_fixed.sql",
    "create_admin.sql",
    "create_admin_account.sql",

    # Password-related files
    "send-password-reset.js",
    "get-cloud-passwords.js"
)

Write-Host "Removing temporary admin and password scripts..." -ForegroundColor Yellow

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

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Cyan
Write-Host "Removed $removedCount files" -ForegroundColor Green
Write-Host "Not found: $notFoundCount files" -ForegroundColor DarkYellow
