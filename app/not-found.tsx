import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 text-center">
      <div className="mb-6 p-6 rounded-full bg-muted/50">
        <FileQuestion className="h-20 w-20 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We couldn&apos;t find the page you were looking for. It might have been removed,
        renamed, or it never existed.
      </p>
      <Button asChild variant="default" size="lg">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}