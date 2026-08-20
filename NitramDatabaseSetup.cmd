@echo off
:: Nitram Logistics - Database Setup Script
:: Run this to initialize database tables and policies

echo ============================================================
echo Nitram Logistics Database Setup
echo ============================================================

:: Project details
set PROJECT_REF=ekuifrbgozeqxvzmbnse

:: Login first (opens browser)
echo [1/3] Logging into Supabase CLI...
supabase login

:: Link project
echo [2/3] Linking to project %PROJECT_REF%...
supabase link --project-ref %PROJECT_REF%
if %ERRORLEVEL% NEQ 0 (
    echo Error linking project. Continuing anyway...
)

:: Push database schema
echo [3/3] Pushing database schema from FIX_DATABASE.sql...
supabase db push
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Database tables created
    echo ============================================================
    echo.
    echo Verify by running:
    echo   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    echo.
) else (
    echo.
    echo ============================================================
    echo ERROR: Database push failed
    echo ============================================================
    echo Trying alternative approach: Running SQL directly...
    echo.
)

pause