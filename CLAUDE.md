# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production bundle 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run Jest test suite

### Development Server Management
If experiencing caching issues or status inconsistencies, restart with:
```bash
# Stop server (Ctrl+C)
rmdir /S /Q .next  # Windows
# or rm -rf .next   # Unix/Mac
npm cache clean --force
npm run dev
```

### Alternative Development Server Management (PowerShell)
Use the provided scripts for automated server restart:
```powershell
# Windows PowerShell
./restart-dev.ps1

# Windows Command Prompt
restart-dev.bat
```

## Development Rules
- do not restart server and npm run dev except i ask for.

## Todos Management
- Always list Todos after completing a task
- Update Todo list regularly to reflect current project status
- Prioritize and track progress on listed Todos

## Database Configuration
- Database Name: smr_augment