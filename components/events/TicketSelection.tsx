"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MinusIcon, PlusIcon, Clock, Ticket } from "lucide-react"
import { format, differenceInSeconds, isBefore } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  maxPerOrder?: number
  minPerOrder?: number
  soldCount: number
  type: 'paid' | 'free'
  status: 'on-sale' | 'paused' | 'sold-out' | 'scheduled'
  saleStart: string
  saleEnd: string
  totalSoldCount?: number
}

interface TicketSelectionProps {
  eventId: string
  ticketTypes: TicketType[]
}

function SaleCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(endDate)
      const diffInSeconds = differenceInSeconds(end, now)

      if (diffInSeconds <= 0) {
        setTimeLeft("Sale ended")
        return
      }

      const days = Math.floor(diffInSeconds / (24 * 60 * 60))
      const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60)
      const seconds = diffInSeconds % 60

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s left`)
      } else {
        setTimeLeft(`${seconds}s left`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{timeLeft}</span>
    </div>
  )
}

export function TicketSelection({ eventId, ticketTypes }: TicketSelectionProps) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>(
    Object.fromEntries(ticketTypes.map((ticket) => [ticket.id, 0]))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minPerOrderMessage, setMinPerOrderMessage] = useState<{ticketId: string, minPerOrder: number} | null>(null)

  useEffect(() => {
    // Clear minimum order message after 5 seconds
    if (minPerOrderMessage) {
      const timer = setTimeout(() => {
        setMinPerOrderMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [minPerOrderMessage]);

  const MAX_TICKETS_PER_ORDER = 10;
  const totalSelectedTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const remainingTickets = MAX_TICKETS_PER_ORDER - totalSelectedTickets;

  const handleQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets((prev) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId)
      if (!ticket) return prev

      const currentQuantity = prev[ticketId] || 0
      const newQuantity = currentQuantity + change
      const newTotalTickets = totalSelectedTickets + change

      // Validate against global order limit
      if (newTotalTickets > MAX_TICKETS_PER_ORDER) {
        setError(`Maximum ${MAX_TICKETS_PER_ORDER} tickets allowed per order`);
        return prev;
      }

      // Clear error if we're reducing quantity
      if (change < 0) {
        setError(null);
      }

      // Validate against min/max per order and available quantity
      if (newQuantity < 0) return prev
      if (ticket.maxPerOrder && newQuantity > ticket.maxPerOrder) return prev
      if (newQuantity > (ticket.quantity - ticket.soldCount)) return prev
      
      // If adding tickets and there's a minimum requirement, automatically set to minimum
      if (change > 0 && currentQuantity === 0 && ticket.minPerOrder && change < ticket.minPerOrder) {
        setMinPerOrderMessage({ ticketId, minPerOrder: ticket.minPerOrder });
        return { ...prev, [ticketId]: ticket.minPerOrder }
      }
      
      // Special case: If decreasing from exactly minPerOrder, jump to 0
      if (change < 0 && ticket.minPerOrder && currentQuantity === ticket.minPerOrder) {
        return { ...prev, [ticketId]: 0 }
      }
      
      // Prevent values between 0 and minPerOrder (0 is allowed, minPerOrder and above is allowed)
      if (ticket.minPerOrder && newQuantity > 0 && newQuantity < ticket.minPerOrder) return prev

      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const totalAmount = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.price * (selectedTickets[ticket.id] || 0),
    0
  )

  const hasSelectedTickets = Object.values(selectedTickets).some((qty) => qty > 0)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Convert selected tickets to the format expected by the API
      const ticketsToReserve = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity
        }));

      // Call the API to reserve tickets
      const reservationResult = await apiClient.tickets.reserve({
        eventId,
        tickets: ticketsToReserve
      });

      if (!reservationResult.success) {
        throw new Error(reservationResult.message || 'Failed to reserve tickets');
      }

      // Encode the tickets data for the URL
      const ticketsParam = encodeURIComponent(JSON.stringify(reservationResult.tickets));

      // Always redirect to checkout page first
      await router.push(`/checkout/${eventId}?tickets=${ticketsParam}`);
    } catch (error) {
      console.error('Error during ticket reservation:', error)
      setError(error instanceof Error ? error.message : 'Failed to reserve tickets')
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tickets</CardTitle>
        <CardDescription className="space-y-1">
          <p>Tickets will be reserved for 10 minutes once you proceed to checkout</p>
          <p className="text-sm font-medium">
            {remainingTickets === MAX_TICKETS_PER_ORDER ? (
              `Maximum ${MAX_TICKETS_PER_ORDER} tickets per order`
            ) : remainingTickets > 0 ? (
              `You can add ${remainingTickets} more ticket${remainingTickets === 1 ? '' : 's'}`
            ) : (
              'Maximum tickets per order reached'
            )}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {minPerOrderMessage && (
          <Alert variant="info" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              {`Minimum purchase of ${minPerOrderMessage.minPerOrder} tickets required for this ticket type. Quantity automatically set to minimum.`}
            </AlertDescription>
          </Alert>
        )}
        
        {ticketTypes.map((ticket) => {
          // Check if we have the new totalSoldCount property, otherwise fall back to soldCount
          const effectiveSoldCount = ('totalSoldCount' in ticket ? ticket.totalSoldCount : ticket.soldCount) ?? 0;
          const availableQuantity = ticket.quantity - effectiveSoldCount;
          const isAvailable = ticket.status === 'on-sale' && availableQuantity > 0;
          const soldPercentage = (effectiveSoldCount / ticket.quantity) * 100;
          const maxAllowed = Math.min(
            availableQuantity,
            ticket.maxPerOrder || Infinity,
            MAX_TICKETS_PER_ORDER - (totalSelectedTickets - (selectedTickets[ticket.id] || 0))
          );

          return (
            <div key={ticket.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>{ticket.name}</Label>
                    {ticket.status && (
                      <Badge variant={
                        ticket.status === 'on-sale' ? 'default' :
                        ticket.status === 'scheduled' ? 'secondary' :
                        ticket.status === 'paused' ? 'outline' :
                        'destructive'
                      }>
                        {ticket.status === 'on-sale' ? 'On Sale' :
                         ticket.status === 'scheduled' ? 'Coming Soon' :
                         ticket.status === 'paused' ? 'Paused' :
                         'Sold Out'}
                      </Badge>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <SaleCountdown endDate={ticket.saleEnd} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Ticket className="h-3 w-3" />
                      <span>{availableQuantity} remaining</span>
                    </div>
                  </div>
                </div>
                <div className="font-medium">
                  {ticket.type === 'free' ? 'Free' : `$${ticket.price.toLocaleString()}`}
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={soldPercentage} className="h-1" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    disabled={!selectedTickets[ticket.id] || !isAvailable || isLoading}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    className="w-20 text-center"
                    value={selectedTickets[ticket.id] || 0}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, 1)}
                    disabled={
                      !isAvailable ||
                      selectedTickets[ticket.id] >= maxAllowed ||
                      isLoading
                    }
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {ticket.maxPerOrder && (
                      <span>Max {ticket.maxPerOrder} per order</span>
                    )}
                  </div>
                </div>
                {ticket.minPerOrder && selectedTickets[ticket.id] > 0 && selectedTickets[ticket.id] < ticket.minPerOrder && (
                  <p className="text-xs text-destructive">
                    Minimum {ticket.minPerOrder} tickets per order
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex w-full items-center justify-between border-t pt-4">
          <div className="space-y-1">
            <div className="text-lg font-semibold">Total</div>
            {hasSelectedTickets && (
              <p className="text-sm text-muted-foreground">
                {totalSelectedTickets} ticket{totalSelectedTickets === 1 ? '' : 's'} selected
              </p>
            )}
          </div>
          <div className="text-lg font-semibold">
            ${totalAmount.toLocaleString()}
          </div>
        </div>
        <Button
          className="w-full relative"
          size="lg"
          disabled={!hasSelectedTickets || isLoading}
          onClick={handleCheckout}
        >
          {isLoading ? (
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
            hasSelectedTickets ? 'Reserve Tickets & Checkout' : 'Select Tickets to Continue'
          )}
        </Button>
        {hasSelectedTickets && (
          <p className="text-xs text-center text-muted-foreground">
            By proceeding, your tickets will be reserved for 10 minutes
          </p>
        )}
      </CardFooter>
    </Card>
  )
}