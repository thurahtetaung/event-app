import { Loader2 } from "lucide-react" // Import Loader2

export default function Loading() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}