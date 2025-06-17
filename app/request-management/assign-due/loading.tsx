import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex flex-col">
        {/* Top navigation */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="container flex h-16 items-center px-4">
            <Skeleton className="h-9 w-40" />
          </div>
        </header>

        <div className="container px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* View toggle */}
          <div className="flex justify-end mb-4">
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Main content */}
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

