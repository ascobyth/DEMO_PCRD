import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Import the AuthProvider
import { AuthProvider } from "@/components/auth-provider"
import { WebpackErrorHandler } from "./webpack-error-handler"
import { ErrorOverlayHider } from "./error-overlay-hider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PCRD Smart Request - Polymer Testing Management System",
  description:
    "Streamline polymer testing workflows with intelligent method selection and efficient request management",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Wrap the children with AuthProvider
  // Find the return statement and update it to include AuthProvider
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WebpackErrorHandler />
          <ErrorOverlayHider />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}