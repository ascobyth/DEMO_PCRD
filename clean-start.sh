#!/bin/bash

echo "🧹 Cleaning Next.js cache and restarting..."

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null

# Clean Next.js build cache
rm -rf .next

# Clear Node.js module cache
npm cache clean --force 2>/dev/null

# Wait a moment for processes to fully terminate
sleep 2

# Start development server
echo "🚀 Starting development server..."
npm run dev