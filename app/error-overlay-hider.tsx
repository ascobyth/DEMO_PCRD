'use client'

import { useEffect } from 'react'

export function ErrorOverlayHider() {
  useEffect(() => {
    // Hide Next.js error overlay immediately
    const style = document.createElement('style')
    style.textContent = `
      /* Hide Next.js error overlay */
      nextjs-portal,
      [id^="__next-build-error"],
      [class*="nextjs-toast"],
      [class*="nextjs__container"],
      react-dev-overlay {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `
    document.head.appendChild(style)

    // Also try to remove error overlay elements directly
    const hideErrorOverlay = () => {
      const selectors = [
        'nextjs-portal',
        '[id^="__next-build-error"]',
        '[class*="nextjs-toast"]',
        '[class*="nextjs__container"]',
        'react-dev-overlay'
      ]
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.remove()
        })
      })
    }

    // Run immediately and after a short delay
    hideErrorOverlay()
    setTimeout(hideErrorOverlay, 100)
    setTimeout(hideErrorOverlay, 500)

    // Observe DOM for new error overlays
    const observer = new MutationObserver(hideErrorOverlay)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      style.remove()
      observer.disconnect()
    }
  }, [])

  return null
}