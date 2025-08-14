@echo off
echo Testing Supabase connection...
echo.

echo Checking if Docker is running...
docker ps > docker_status.txt 2>&1
type docker_status.txt
echo.

echo Checking Supabase status...
supabase status > supabase_status.txt 2>&1
type supabase_status.txt
echo.

echo Starting Supabase if not running...
supabase start > supabase_start.txt 2>&1
type supabase_start.txt
echo.

echo Testing API connection...
curl -s "http://127.0.0.1:54321/rest/v1/properties?select=count" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" > api_test.txt 2>&1
type api_test.txt
echo.

pause
