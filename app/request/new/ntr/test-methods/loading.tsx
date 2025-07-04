export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading test methods...</p>
      </div>
    </div>
  )
}