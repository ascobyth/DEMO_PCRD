"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastActionElement = React.ReactNode
export type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  onClose?: () => void
  variant?: 'default' | 'destructive'
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="fixed top-0 right-0 z-50 p-4 space-y-4">{children}</div>
}

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & ToastProps>(
  ({ className, title, description, action, onClose, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border rounded-md shadow-lg p-4 flex items-start gap-3 w-full max-w-sm",
          variant === 'destructive'
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-background border",
          className,
        )}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && <div className="font-medium">{title}</div>}
          {description && (
            <div className={cn(
              "text-sm",
              variant === 'destructive' ? "text-destructive-foreground" : "text-muted-foreground"
            )}>
              {description}
            </div>
          )}
        </div>
        {action && <React.Fragment>{action}</React.Fragment>}
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  },
)
Toast.displayName = "Toast"

export { ToastProvider, Toast }

