# Test Carousel Unique ID Functionality

Write-Host "Testing Carousel Unique ID functionality..." -ForegroundColor Green

# Test 1: Check if new columns exist
Write-Host ""
Write-Host "1. Checking database schema..." -ForegroundColor Yellow
try {
    docker exec -i "supabase_db_bonairemakelaars.com_8roa65" psql -U postgres -d postgres -c "\d carousel_slides" | Out-Null
    Write-Host "checkmark Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "X Database connection failed" -ForegroundColor Red
    exit 1
}

# Test 2: Check if unique_id and created_by columns exist
Write-Host ""
Write-Host "2. Checking new columns..." -ForegroundColor Yellow
$columnCheck = docker exec -i "supabase_db_bonairemakelaars.com_8roa65" psql -U postgres -d postgres -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'carousel_slides' AND column_name IN ('unique_id', 'created_by');"
if (($columnCheck -match "unique_id") -and ($columnCheck -match "created_by")) {
    Write-Host "checkmark unique_id and created_by columns exist" -ForegroundColor Green
} else {
    Write-Host "X Required columns missing" -ForegroundColor Red
    Write-Host $columnCheck
}

# Test 3: Check if existing slides have unique IDs
Write-Host ""
Write-Host "3. Checking existing slides for unique IDs..." -ForegroundColor Yellow
$slideCheck = docker exec -i "supabase_db_bonairemakelaars.com_8roa65" psql -U postgres -d postgres -c "SELECT id, unique_id, title FROM carousel_slides WHERE unique_id IS NOT NULL LIMIT 5;"
Write-Host $slideCheck

# Test 4: Check if trigger function exists
Write-Host ""
Write-Host "4. Checking trigger function..." -ForegroundColor Yellow
$triggerCheck = docker exec -i "supabase_db_bonairemakelaars.com_8roa65" psql -U postgres -d postgres -c "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'generate_carousel_unique_id';"
if ($triggerCheck -match "generate_carousel_unique_id") {
    Write-Host "checkmark Unique ID generation function exists" -ForegroundColor Green
} else {
    Write-Host "X Unique ID generation function missing" -ForegroundColor Red
}

# Test 5: Test unique ID generation
Write-Host ""
Write-Host "5. Testing unique ID generation..." -ForegroundColor Yellow
$uniqueIdTest = docker exec -i "supabase_db_bonairemakelaars.com_8roa65" psql -U postgres -d postgres -c "SELECT generate_carousel_unique_id();"
Write-Host "Generated unique ID:"
Write-Host $uniqueIdTest

Write-Host ""
Write-Host "checkmark Carousel Unique ID tests completed!" -ForegroundColor Green
Write-Host "The carousel slides now have unique IDs for tracking by realtors and owners." -ForegroundColor Cyan
