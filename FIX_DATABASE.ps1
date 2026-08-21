# Nitram Logistics - Database Fix Script
# This script opens the Supabase SQL Editor and copies the setup SQL to your clipboard

param(
    [string]$ProjectRef = "ekuifrbgozeqxvzmbnse",
    [string]$SqlFile = "$PSScriptRoot\supabase\FIX_DATABASE.sql",
    [string]$AlterFile = "$PSScriptRoot\supabase\ALTER_TABLES.sql",
    [string]$SeedFile = "$PSScriptRoot\supabase\SEED_DATA.sql"
)

# Read the SQL file
if (-not (Test-Path $SqlFile)) {
    Write-Host "ERROR: SQL file not found at: $SqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $SqlFile -Raw

# Copy SQL to clipboard
Set-Clipboard -Value $sqlContent
Write-Host "Schema SQL copied to clipboard" -ForegroundColor Green

# Open Supabase SQL Editor
$sqlEditorUrl = "https://supabase.com/dashboard/project/$ProjectRef/editor"
Write-Host ""
Write-Host "Opening Supabase SQL Editor in your browser..." -ForegroundColor Cyan
Start-Process $sqlEditorUrl

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Yellow
Write-Host "NITRAM LOGISTICS - DATABASE SETUP INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "STEP 1: Run Schema SQL" -ForegroundColor White
Write-Host "  1. Paste the SQL from your clipboard (Ctrl+V) into the editor." -ForegroundColor Gray
Write-Host "  2. Click the RUN button (or press Ctrl+Enter)." -ForegroundColor Gray
Write-Host "  3. Wait for 'Success' message." -ForegroundColor Gray
Write-Host ""

if (Test-Path $AlterFile) {
    Write-Host "STEP 1b: Run Alter Table SQL (if needed)" -ForegroundColor White
    Write-Host "  If you got errors about missing columns (like 'approved'), run this:" -ForegroundColor Gray
    Write-Host "  1. Clear the editor and paste: supabase\ALTER_TABLES.sql" -ForegroundColor Gray
    Write-Host "  2. Click RUN" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "STEP 2: Create Admin User" -ForegroundColor White
Write-Host "  1. Go to: https://supabase.com/dashboard/project/$ProjectRef/auth/users" -ForegroundColor Gray
Write-Host "  2. Click Create User" -ForegroundColor Gray
Write-Host "  3. Email: admin@nitramclearing.co.zm" -ForegroundColor Gray
Write-Host "  4. Password: password123" -ForegroundColor Gray
Write-Host "  5. Copy the generated User UUID" -ForegroundColor Gray
Write-Host ""
Write-Host "STEP 3: Create Admin Profile" -ForegroundColor White
Write-Host "  1. Go back to the SQL Editor" -ForegroundColor Gray
Write-Host "  2. Clear the previous SQL and paste this:" -ForegroundColor Gray
Write-Host "     INSERT INTO profiles (id, email, full_name, role, is_active)" -ForegroundColor Gray
Write-Host "     VALUES ('YOUR_ADMIN_UUID_HERE', 'admin@nitramclearing.co.zm', 'Demo Admin', 'super_admin', true);" -ForegroundColor Gray
Write-Host "  3. Replace YOUR_ADMIN_UUID_HERE with the UUID from Step 2" -ForegroundColor Gray
Write-Host "  4. Click RUN" -ForegroundColor Gray
Write-Host ""

if (Test-Path $SeedFile) {
    Write-Host "STEP 4: Seed Example Data (Optional)" -ForegroundColor White
    Write-Host "  1. In the SQL Editor, paste the contents of: supabase/SEED_DATA.sql" -ForegroundColor Gray
    Write-Host "  2. Click RUN to populate example customers, leads, quotes, and shipments" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "STEP 5: Start the App" -ForegroundColor White
Write-Host "  1. Restart your dev server: npm run dev" -ForegroundColor Gray
Write-Host "  2. Go to http://localhost:8080/login" -ForegroundColor Gray
Write-Host "  3. Sign in with:" -ForegroundColor Gray
Write-Host "     Email: admin@nitramclearing.co.zm" -ForegroundColor Gray
Write-Host "     Password: password123" -ForegroundColor Gray
Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
