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

interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  type: 'paid' | 'free'
  saleStart: string
  saleEnd: string
  maxPerOrder?: number
  minPerOrder?: number
  status?: 'on-sale' | 'paused' | 'sold-out' | 'scheduled'
  soldCount?: number
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
  const [isReserving, setIsReserving] = useState(false)

  const handleQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets((prev) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId)
      if (!ticket) return prev

      const currentQuantity = prev[ticketId] || 0
      const newQuantity = currentQuantity + change

      // Validate against min/max per order and available quantity
      if (newQuantity < 0) return prev
      if (ticket.maxPerOrder && newQuantity > ticket.maxPerOrder) return prev
      if (newQuantity > (ticket.quantity - (ticket.soldCount || 0))) return prev
      if (ticket.minPerOrder && newQuantity > 0 && newQuantity < ticket.minPerOrder) return prev

      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const totalAmount = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.price * (selectedTickets[ticket.id] || 0),
    0
  )

  const handleCheckout = async () => {
    try {
      setIsReserving(true)
      const selectedTicketTypes = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id, quantity]) => {
          const ticket = ticketTypes.find(t => t.id === id)
          return {
            id,
            name: ticket?.name,
            quantity,
            price: ticket?.price || 0
          }
        })

      // Calculate total items
      const totalItems = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)

      // Note: Don't reset isReserving as we want to show loading state during navigation
      router.push(`/checkout/${eventId}?tickets=${encodeURIComponent(JSON.stringify(selectedTicketTypes))}`)
    } catch (error) {
      console.error('Failed to proceed to checkout:', error)
      setIsReserving(false) // Only reset on error
    }
  }

  const hasSelectedTickets = Object.values(selectedTickets).some((quantity) => quantity > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tickets</CardTitle>
        <CardDescription>
          Tickets will be reserved for 10 minutes once you proceed to checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {ticketTypes.map((ticket) => {
          const availableQuantity = ticket.quantity - (ticket.soldCount || 0)
          const isAvailable = ticket.status === 'on-sale' && availableQuantity > 0
          const soldPercentage = ((ticket.soldCount || 0) / ticket.quantity) * 100

          return (
            <div key={ticket.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>{ticket.name}</Label>
                    {ticket.status && (
                      <Badge variant={
                        ticket.status === 'on-sale' ? 'default' :
                        ticket.status === 'sold-out' ? 'destructive' :
                        'secondary'
                      }>
                        {ticket.status === 'on-sale' ? 'On Sale' :
                         ticket.status === 'sold-out' ? 'Sold Out' :
                         ticket.status === 'scheduled' ? 'Coming Soon' :
                         'Sale Ended'}
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
                    disabled={!selectedTickets[ticket.id] || !isAvailable}
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
                      (ticket.maxPerOrder && selectedTickets[ticket.id] >= ticket.maxPerOrder) ||
                      selectedTickets[ticket.id] >= availableQuantity
                    }
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  {ticket.maxPerOrder && (
                    <span className="text-xs text-muted-foreground">
                      Max {ticket.maxPerOrder} per order
                    </span>
                  )}
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
                {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)} tickets selected
              </p>
            )}
          </div>
          <div className="text-lg font-semibold">
            ${totalAmount.toLocaleString()}
          </div>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!hasSelectedTickets || isReserving}
          onClick={handleCheckout}
        >
          {isReserving ? (
            <>
              <span className="mr-2">Reserving Tickets...</span>
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