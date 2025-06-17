Write-Host "🔧 Fixing webpack chunk loading error..." -ForegroundColor Cyan

# Kill any running Next.js processes
Write-Host "📍 Stopping Next.js server..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
}

# Clean Next.js cache
Write-Host "🧹 Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
}

# Clean npm cache
Write-Host "🧹 Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Optional: Clear browser cache reminder
Write-Host "`n💡 Reminder: Clear your browser cache for best results" -ForegroundColor Green
Write-Host "   Chrome: Ctrl+Shift+R" -ForegroundColor White
Write-Host "   Edge: Ctrl+Shift+R" -ForegroundColor White
Write-Host "   Firefox: Ctrl+Shift+R" -ForegroundColor White

# Restart development server
Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
npm run dev