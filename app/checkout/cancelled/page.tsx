"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutCancelledPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")

  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <XCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your payment was cancelled. No charges were made.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {eventId && (
            <Button
              className="w-full"
              onClick={() => router.push(`/events/${eventId}`)}
            >
              Try Again
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/events">Browse Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}