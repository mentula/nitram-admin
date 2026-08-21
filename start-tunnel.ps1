# Quick script to expose localhost to internet
# Usage: .\start-tunnel.ps1

Write-Host "🚀 Nitram CRM - Tunnel Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
$cloudflaredInstalled = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $ngrokInstalled -and -not $cloudflaredInstalled) {
    Write-Host "❌ Neither ngrok nor cloudflared is installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of them:" -ForegroundColor Yellow
    Write-Host "  Option 1 (ngrok - Recommended):" -ForegroundColor Green
    Write-Host "    winget install ngrok" -ForegroundColor White
    Write-Host ""
    Write-Host "  Option 2 (Cloudflare):" -ForegroundColor Green
    Write-Host "    winget install Cloudflare.cloudflared" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Ask which port
$port = Read-Host "Enter the port your dev server is running on (default: 8080)"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "8080"
}

Write-Host ""
Write-Host "✅ Using port: $port" -ForegroundColor Green
Write-Host ""

# Choose tunnel service
if ($ngrokInstalled -and $cloudflaredInstalled) {
    Write-Host "Both ngrok and cloudflared are installed." -ForegroundColor Cyan
    Write-Host "Which one do you want to use?" -ForegroundColor Cyan
    Write-Host "  1. ngrok (has web UI at http://127.0.0.1:4040)" -ForegroundColor White
    Write-Host "  2. cloudflared (faster, simpler)" -ForegroundColor White
    $choice = Read-Host "Enter choice (1 or 2)"
    
    if ($choice -eq "2") {
        $useTool = "cloudflared"
    } else {
        $useTool = "ngrok"
    }
} elseif ($ngrokInstalled) {
    $useTool = "ngrok"
} else {
    $useTool = "cloudflared"
}

Write-Host ""
Write-Host "🌐 Starting tunnel with $useTool..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure your dev server is running on port $port" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel when done." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Start the tunnel
if ($useTool -eq "ngrok") {
    Write-Host "📊 Web UI available at: http://127.0.0.1:4040" -ForegroundColor Green
    Write-Host ""
    & ngrok http $port
} else {
    & cloudflared tunnel --url "http://localhost:$port"
}
