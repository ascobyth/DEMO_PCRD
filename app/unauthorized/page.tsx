"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-100">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            Your current role ({user?.role}) doesn't have the necessary permissions to view this content.
          </p>
          <p className="text-center text-gray-600">
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

