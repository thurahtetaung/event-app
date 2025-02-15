"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Common error messages for better UX
const ERROR_MESSAGES: Record<string, string> = {
  card_declined: "Your card was declined. Please try a different payment method.",
  insufficient_funds: "Insufficient funds in your account. Please try a different card.",
  expired_card: "Your card has expired. Please use a different card.",
  processing_error: "We couldn't process your payment. Please try again.",
  authentication_failed: "Payment authentication failed. Please try again.",
  invalid_card: "Invalid card details. Please check and try again.",
}

export default function CheckoutFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const errorCode = searchParams.get("code")

  // Get user-friendly error message or use custom message if provided
  const errorMessage = searchParams.get("message") ||
    (errorCode && ERROR_MESSAGES[errorCode]) ||
    "We couldn't complete your payment. Please try again."

  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
          {errorCode && (
            <p className="font-mono text-xs text-muted-foreground">
              Reference: {errorCode}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {eventId && (
            <Button
              className="w-full"
              onClick={() => router.push(`/events/${eventId}?retry=true`)}
            >
              Try Again
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/support">Contact Support</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}