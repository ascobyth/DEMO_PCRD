import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import CreateRequestForm from "@/components/create-request-form"
import { Button } from "@/components/ui/button"

export default function CreateRequestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <div className="absolute inset-[2px] rounded-full bg-white" />
              <div className="absolute inset-[4px] rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
            </div>
            <span className="text-xl font-bold">PCRD Smart Request</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create New Request</h1>
            <p className="text-muted-foreground mt-2">Complete the form below to create a new request in the system.</p>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <CreateRequestForm />
          </div>
        </div>
      </main>
      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
              <div className="absolute inset-[1.5px] rounded-full bg-white" />
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-r from-green-400 to-blue-400" />
            </div>
            <span className="text-lg font-bold">PCRD Smart Request</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} PCRD Smart Request. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

