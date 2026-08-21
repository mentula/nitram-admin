# Remote Sharing Script - Tries Multiple Methods
# Usage: .\share-remote.ps1

Write-Host "🌐 Remote Sharing for Vite App" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
Write-Host "⚠️  IMPORTANT: Make sure your dev server is running!" -ForegroundColor Yellow
Write-Host "   Run this in another terminal: npm run dev:share" -ForegroundColor Yellow
Write-Host ""
$continue = Read-Host "Is your dev server running? (y/n)"
if ($continue -ne "y") {
    Write-Host "Start dev server first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Choose a method:" -ForegroundColor Cyan
Write-Host "  1. Cloudflare Tunnel (Recommended)" -ForegroundColor Green
Write-Host "  2. localhost.run (Zero install)" -ForegroundColor Green
Write-Host "  3. Serveo (Alternative)" -ForegroundColor Green
Write-Host "  4. Deploy to Vercel (Permanent)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        # Cloudflare Tunnel
        Write-Host ""
        Write-Host "📦 Checking for cloudflared..." -ForegroundColor Cyan
        
        $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
        
        if (-not $cloudflared) {
            Write-Host "Installing Cloudflare Tunnel..." -ForegroundColor Yellow
            winget install Cloudflare.cloudflared
            Write-Host "✅ Installed! Restart this script." -ForegroundColor Green
            exit
        }
        
        Write-Host "🚀 Starting Cloudflare Tunnel..." -ForegroundColor Green
        Write-Host "Copy the HTTPS URL and share it!" -ForegroundColor Yellow
        Write-Host ""
        cloudflared tunnel --url http://localhost:8080
    }
    
    "2" {
        # localhost.run
        Write-Host ""
        Write-Host "🚀 Starting localhost.run tunnel..." -ForegroundColor Green
        Write-Host "Copy the URL and share it!" -ForegroundColor Yellow
        Write-Host ""
        ssh -R 80:localhost:8080 nokey@localhost.run
    }
    
    "3" {
        # Serveo
        Write-Host ""
        Write-Host "🚀 Starting Serveo tunnel..." -ForegroundColor Green
        Write-Host "Copy the URL and share it!" -ForegroundColor Yellow
        Write-Host ""
        ssh -R 80:localhost:8080 serveo.net
    }
    
    "4" {
        # Vercel Deploy
        Write-Host ""
        Write-Host "📦 Checking for Vercel CLI..." -ForegroundColor Cyan
        
        $vercel = Get-Command vercel -ErrorAction SilentlyContinue
        
        if (-not $vercel) {
            Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
        Write-Host ""
        vercel
    }
    
    default {
        Write-Host "Invalid choice. Please run again and choose 1-4." -ForegroundColor Red
    }
}
