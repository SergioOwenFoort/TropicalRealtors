# PowerShell script to apply both SQL fixes
# Run this script to generate a unified SQL fix that combines both solutions

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Combined SQL output file
$combinedSqlPath = Join-Path $scriptDir "unified_supabase_fix.sql"

# Write the SQL header
@"
-- UNIFIED SUPABASE FIX - COMBINES BOTH AUTHENTICATION AND RECURSION FIXES
-- RUN THIS SCRIPT IN THE SUPABASE SQL EDITOR USING SERVICE ROLE CONNECTION
-- IMPORTANT: Select 'service_role' from the dropdown menu at the top

"@ | Out-File -FilePath $combinedSqlPath -Encoding utf8

# Add the auth schema fix from quick_auth_schema_fix.sql
$authSchemaFixPath = Join-Path $scriptDir "quick_auth_schema_fix.sql"
if (Test-Path $authSchemaFixPath) {
    Get-Content $authSchemaFixPath | Out-File -FilePath $combinedSqlPath -Append -Encoding utf8
} else {
    "-- Warning: Auth schema fix file not found" | Out-File -FilePath $combinedSqlPath -Append -Encoding utf8
}

# Add the combined fix
$combinedFixPath = Join-Path $scriptDir "combined_auth_fix.sql"
if (Test-Path $combinedFixPath) {
    "`n`n-- COMBINED AUTH AND RECURSION FIX`n" | Out-File -FilePath $combinedSqlPath -Append -Encoding utf8
    Get-Content $combinedFixPath | Out-File -FilePath $combinedSqlPath -Append -Encoding utf8
} else {
    "-- Warning: Combined auth fix file not found" | Out-File -FilePath $combinedSqlPath -Append -Encoding utf8
}

# Output success message
Write-Host "Unified SQL fix generated at: $combinedSqlPath"
Write-Host "Please run this SQL in the Supabase SQL Editor with the service_role connection."
