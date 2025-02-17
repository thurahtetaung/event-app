"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, MapPin, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startTimestamp: string;
  endTimestamp: string;
  venue: string | null;
  address: string | null;
  category: string;
  isOnline: boolean;
  coverImage?: string;
  organization?: {
    name: string;
  };
}

export default function CheckoutPage({
  params
}: {
  params: { eventId: string };
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse selected tickets from URL
  const selectedTickets = searchParams.get('tickets')
    ? JSON.parse(decodeURIComponent(searchParams.get('tickets')!))
    : []

  const totalAmount = selectedTickets.reduce(
    (sum: number, ticket: any) => sum + ticket.price * ticket.quantity,
    0
  )

  const fetchEvent = useCallback(async () => {
    let isCancelled = false;

    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.events.getById(params.eventId)
      if (!isCancelled) {
        setEvent(data)
      }
    } catch (error: any) {
      if (error.message === 'Request was cancelled' || isCancelled) {
        return;
      }
      console.error("Failed to fetch event:", error)
      if (!isCancelled) {
        setError(error.message || "Failed to load event details")
      }
    } finally {
      if (!isCancelled) {
        setIsLoading(false)
      }
    }

    return () => {
      isCancelled = true;
    }
  }, [params.eventId])

  useEffect(() => {
    const cleanupFn = fetchEvent();
    return () => {
      cleanupFn.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [fetchEvent])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      router.push(`/events/${params.eventId}`)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router, params.eventId])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true)
      setError(null)

      if (totalAmount === 0) {
        // Handle free tickets reservation
        try {
          const response = await apiClient.tickets.reserveFree({
            eventId: params.eventId,
            tickets: selectedTickets
          })

          // Redirect to success page with order details
          router.push(`/checkout/success?eventId=${params.eventId}&orderId=${response.orderId}`)
        } catch (error: any) {
          setError(error.message || 'Failed to reserve free tickets')
          setIsCheckingOut(false)
        }
      } else {
        // Handle paid tickets with Stripe
        try {
          const response = await apiClient.checkout.createSession({
            eventId: params.eventId,
            tickets: selectedTickets
          })

          // Redirect to Stripe checkout
          router.push(response.url)
        } catch (error: any) {
          setError(error.message || 'Failed to create checkout session')
          setIsCheckingOut(false)
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      setError(error.message || 'Failed to process checkout')
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-16 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load checkout"}</AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          asChild
          className="mt-4"
        >
          <Link href={`/events/${params.eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4"
        >
          <Link href={`/events/${params.eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time remaining</p>
            <p className="text-xl font-semibold">{formatTime(timeLeft)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {selectedTickets.map((ticket: any) => (
                <div key={ticket.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${ticket.price.toLocaleString()} × {ticket.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(ticket.price * ticket.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">${totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Important Information</h2>
            <div className="space-y-4 text-sm">
              <p>• Tickets will be emailed to you {totalAmount === 0 ? 'after reservation' : 'after successful payment'}</p>
              <p>• Each ticket has a unique QR code for entry</p>
              <p>• Tickets are non-refundable but can be transferred</p>
              <p>• Please arrive 15 minutes before the event starts</p>
            </div>
          </Card>
        </div>

        {/* Event Details */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
              <Image
                src={event.coverImage || '/placeholder.jpg'}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <Badge variant="secondary" className="mb-4">
              {event.category}
            </Badge>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(event.startTimestamp), "EEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(event.startTimestamp), "h:mm a")} -{" "}
                  {format(new Date(event.endTimestamp), "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.isOnline ? "Online Event" : event.venue || event.address}
                </span>
              </div>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              <>
                <span className="mr-2">{totalAmount === 0 ? 'Reserving...' : 'Processing...'}</span>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </>
            ) : (
              totalAmount === 0 ? 'Reserve Free Tickets' : 'Proceed to Payment'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {totalAmount === 0
              ? "Your tickets will be emailed to you after reservation"
              : "You will be redirected to our secure payment provider"
            }
          </p>
        </div>
      </div>
    </div>
  );
}