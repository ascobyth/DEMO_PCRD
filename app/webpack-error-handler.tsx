'use client'

import { useEffect } from 'react'

// Initialize error handler immediately, not in useEffect
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args: any[]) => {
    const errorString = args.join(' ')
    if (
      errorString.includes('webpack') ||
      errorString.includes('ChunkLoadError') ||
      errorString.includes('Loading chunk') ||
      errorString.includes('preloadModule') ||
      errorString.includes('resolveModule') ||
      errorString.includes('Failed to fetch dynamically imported module') ||
      errorString.includes('Cannot find module') ||
      errorString.includes('Module not found') ||
      errorString.includes('Loading CSS chunk') ||
      errorString.includes('Failed to import')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function WebpackErrorHandler() {
  useEffect(() => {
    // Handle webpack errors in both development and production
    const originalError = console.error
    console.error = (...args: any[]) => {
      // Filter out webpack-related errors
      const errorString = args.join(' ')
      if (
        errorString.includes('webpack') ||
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('preloadModule') ||
        errorString.includes('resolveModule') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        errorString.includes('Cannot find module') ||
        errorString.includes('Module not found') ||
        errorString.includes('Loading CSS chunk') ||
        errorString.includes('Failed to import')
      ) {
        return
      }
      // Call original console.error for other errors
      originalError.apply(console, args)
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || ''
      const errorStack = event.reason?.stack || ''
      
      if (
        errorMessage.includes('webpack') ||
        errorStack.includes('webpack') ||
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Module not found')
      ) {
        event.preventDefault()
        
        // Try to reload the page if it's a chunk loading error after navigation
        if (errorMessage.includes('ChunkLoadError') && window.location.pathname !== '/login') {
          console.log('[Webpack] Chunk loading error detected, attempting recovery...')
          // Give a small delay before reload to prevent infinite loops
          setTimeout(() => {
            if (!window.__webpackChunkReloadAttempted) {
              window.__webpackChunkReloadAttempted = true
              window.location.reload()
            }
          }, 1000)
        }
      }
    }

    // Handle error events
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes('webpack') ||
        event.message.includes('ChunkLoadError') ||
        event.message.includes('Module not found')
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    window.addEventListener('error', handleError)

    // Reset reload flag on successful page load
    window.__webpackChunkReloadAttempted = false

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}

// Type declaration for the global flag
declare global {
  interface Window {
    __webpackChunkReloadAttempted?: boolean
  }
}