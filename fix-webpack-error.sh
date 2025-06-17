#!/bin/bash

echo "🔧 Fixing webpack chunk loading error..."

# Kill any running Next.js processes
echo "📍 Stopping Next.js server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clean Next.js cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Optional: Clear browser cache reminder
echo "💡 Reminder: Clear your browser cache for best results"
echo "   Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)"
echo "   Safari: Cmd+Option+E then Cmd+R"

# Restart development server
echo "🚀 Starting development server..."
npm run dev