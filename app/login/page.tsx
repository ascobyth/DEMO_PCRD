"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Import the useAuth hook
import { useAuth } from "@/components/auth-provider"

// Update the LoginPage component to use the auth context
export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        // Use replace instead of push to avoid back navigation issues
        // Add a small delay to ensure auth state is fully updated
        setTimeout(() => {
          router.replace("/dashboard")
        }, 100)
      } else {
        setError("Invalid email or password")
        setIsLoading(false)
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <div className="relative h-12 w-12 mb-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <div className="absolute inset-[3px] rounded-full bg-white" />
              <div className="absolute inset-[6px] rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-9 tracking-tight text-gray-900">PCRD Smart Request</h2>
            <p className="mt-2 text-sm text-center text-gray-600">Polymer Characterization Research and Development</p>
          </div>

          <div className="mt-10">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="pl-10"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                    <Label htmlFor="remember-me" className="text-sm leading-6 text-gray-600">
                      Remember me
                    </Label>
                  </div>

                  <div className="text-sm leading-6">
                    <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
                <div className="mt-4 text-sm text-center text-gray-500">
                  <p>Default admin account: admin@admin.com</p>
                  <p>Password: admin123</p>
                </div>
              </form>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-green-400 to-blue-500" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="max-w-2xl text-center text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome to PCRD Smart Request System</h1>
            <p className="mt-6 text-xl">
              Streamlining polymer testing workflows with intelligent method selection and efficient request management
            </p>
            <div className="absolute bottom-4 right-4 text-xs text-white/70">
              <p>Powered by AI-Techology</p>
              <p>Developed by PCRD-Staff</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

