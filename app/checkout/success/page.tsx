"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const orderId = searchParams.get("orderId")

  return (
    <div className="container max-w-lg py-16">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {orderId && (
            <p className="font-mono text-sm">
              Order ID: {orderId}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/my-events">View My Tickets</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/events">Browse More Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

