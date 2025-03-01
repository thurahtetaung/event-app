"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12 text-center">
      <div className="mb-6 p-6 rounded-full bg-muted/50">
        <div className="h-16 w-16 text-destructive">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
        Something went wrong
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error. Our team has been notified and is working on a fix.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          variant="default"
          size="lg"
        >
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}