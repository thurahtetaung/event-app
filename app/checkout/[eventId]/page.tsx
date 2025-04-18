"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatTime } from "@/lib/utils"

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
  category?: string;
  isOnline: boolean;
  coverImage?: string;
  organization?: {
    name: string;
  };
  categoryObject?: {
    id: string;
    name: string;
    icon: string;
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
  const [reservationStatus] = useState<'reserved'>('reserved')
  // Use a ref to track if we should release tickets
  const shouldReleaseTicketsRef = useRef(true)
  // Use a ref to track initial mount
  const isInitialMount = useRef(true)

  // Parse selected tickets from URL
  const selectedTickets = searchParams.get('tickets')
    ? JSON.parse(decodeURIComponent(searchParams.get('tickets')!))
    : [];

  // Calculate total amount using the tickets from URL
  const totalAmount = selectedTickets.reduce(
    (sum: number, ticket: any) => sum + (ticket.price || 0) * ticket.quantity,
    0
  );

  // Function to release reservations and go back to event page
  const handleReleaseAndGoBack = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default Link behavior
    try {
      // Call the API to release reserved tickets
      await apiClient.tickets.releaseReservations();
      // We've explicitly released tickets, so don't do it again on unmount
      shouldReleaseTicketsRef.current = false;
      console.log("Successfully released ticket reservations");
    } catch (error) {
      console.error("Error releasing ticket reservations:", error);
    } finally {
      // Always navigate back to event page
      router.push(`/events/${params.eventId}`);
    }
  };

  const fetchEvent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.events.getById(params.eventId)
      setEvent(data)
    } catch (error: any) {
      console.error("Failed to fetch event:", error)
      setError(error.message || "Failed to load event details")
    } finally {
      setIsLoading(false)
    }
  }, [params.eventId])

  // Fetch event details
  useEffect(() => {
    fetchEvent();
    // No cleanup needed for this effect
  }, [fetchEvent]);

  // Handle page unload/navigation away
  useEffect(() => {
    // Mark initial mount as complete after the first effect
    const currentIsInitialMount = isInitialMount.current;
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard behavior to show confirmation dialog
      e.preventDefault();
      e.returnValue = '';

      // Only release tickets on beforeunload if we need to
      if (shouldReleaseTicketsRef.current) {
        // Use the dedicated apiClient method for sendBeacon
        const { url, data } = apiClient.tickets.getReleaseReservationsBeaconData();
        navigator.sendBeacon(url, data);
      }
    };

    // For normal unmounting, use the apiClient as originally intended
    const handleUnmount = async () => {
      try {
        // Don't release tickets on initial mount or if explicitly prevented
        if (!currentIsInitialMount && shouldReleaseTicketsRef.current) {
          await apiClient.tickets.releaseReservations();
          console.log("Released tickets on component unmount");
        } else {
          console.log("Skipped releasing tickets: " +
            (currentIsInitialMount ? "initial mount" : "checkout in progress"));
        }
      } catch (error) {
        console.error("Error releasing tickets on component unmount:", error);
      }
    };

    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleUnmount();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      try {
        // Tickets will be released explicitly here, so don't do it on unmount
        shouldReleaseTicketsRef.current = false;
        // Release tickets when timer expires
        apiClient.tickets.releaseReservations()
          .then(() => console.log("Successfully released ticket reservations due to timeout"))
          .catch(err => console.error("Error releasing ticket reservations:", err))
          .finally(() => router.push(`/events/${params.eventId}`));
      } catch (error) {
        console.error("Error in timeout handler:", error);
        router.push(`/events/${params.eventId}`);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router, params.eventId])

  // Format countdown timer display
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true)
      setError(null)

      // Prevent ticket release on successful checkout
      shouldReleaseTicketsRef.current = false;

      // Extract all specific ticket IDs from the selected tickets
      // This ensures we use EXACTLY the same tickets that were reserved
      const allTicketIds = selectedTickets.flatMap((ticket: any) =>
        ticket.ticketIds || []
      );

      if (allTicketIds.length === 0) {
        console.warn("No specific ticket IDs found in selected tickets");
      } else {
        console.log(`Found ${allTicketIds.length} specific ticket IDs to purchase`);
      }

      // Process the purchase with the specific ticket IDs
      const purchaseResult = await apiClient.tickets.purchase({
        eventId: params.eventId,
        tickets: selectedTickets.map((ticket: any) => ({
          ticketTypeId: ticket.ticketTypeId,
          quantity: ticket.quantity
        })),
        specificTicketIds: allTicketIds.length > 0 ? allTicketIds : undefined
      });

      if (purchaseResult.isFree) {
        // For free tickets, redirect to success page
        router.push(`/checkout/success?eventId=${params.eventId}`);
      } else {
        // For paid tickets, redirect to Stripe checkout
        if (!purchaseResult.checkoutUrl) {
          throw new Error('No checkout URL provided for paid tickets');
        }
        window.location.href = purchaseResult.checkoutUrl;
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load checkout"}</AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={handleReleaseAndGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
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
          className="mb-4"
          onClick={handleReleaseAndGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time remaining</p>
            {timeLeft > 0 && (
              <p className="text-xl font-semibold">{formatCountdown(timeLeft)}</p>
            )}
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
              {event.categoryObject?.name || event.category || 'Uncategorized'}
            </Badge>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(event.startTimestamp, "EEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(event.startTimestamp)} - {formatTime(event.endTimestamp)}
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isCheckingOut || reservationStatus !== 'reserved'}
          >
            {isCheckingOut ? (
              <>
                <span className="mr-2">Processing...</span>
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
              totalAmount === 0 ? 'Confirm Free Tickets' : 'Proceed to Payment'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {reservationStatus === 'reserved' ? (
              totalAmount === 0
                ? "Your tickets are reserved and will be confirmed upon completion"
                : "Your tickets are reserved and will be confirmed after payment"
            ) : (
              "Failed to reserve tickets. Redirecting back to event page..."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}