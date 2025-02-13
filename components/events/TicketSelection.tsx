"use client"

import { useState } from "react"
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
import { MinusIcon, PlusIcon } from "lucide-react"

interface TicketType {
  id: string
  name: string
  price: number
  description: string
  available: number
}

interface TicketSelectionProps {
  eventId: string
  ticketTypes: TicketType[]
}

export function TicketSelection({ eventId, ticketTypes }: TicketSelectionProps) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>(
    Object.fromEntries(ticketTypes.map((ticket) => [ticket.id, 0]))
  )

  const handleQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets((prev) => {
      const ticket = ticketTypes.find((t) => t.id === ticketId)
      if (!ticket) return prev

      const newQuantity = Math.max(0, Math.min(ticket.available, (prev[ticketId] || 0) + change))
      return { ...prev, [ticketId]: newQuantity }
    })
  }

  const totalAmount = ticketTypes.reduce(
    (sum, ticket) => sum + ticket.price * (selectedTickets[ticket.id] || 0),
    0
  )

  const handleCheckout = () => {
    router.push(`/checkout?eventId=${eventId}&tickets=${JSON.stringify(selectedTickets)}`)
  }

  const hasSelectedTickets = Object.values(selectedTickets).some((quantity) => quantity > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tickets</CardTitle>
        <CardDescription>Choose the number of tickets you want to purchase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ticketTypes.map((ticket) => (
          <div key={ticket.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>{ticket.name}</Label>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>
              <div className="font-medium">
                ${ticket.price.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(ticket.id, -1)}
                disabled={!selectedTickets[ticket.id]}
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
                disabled={selectedTickets[ticket.id] >= ticket.available}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex w-full items-center justify-between border-t pt-4">
          <div className="text-lg font-semibold">Total</div>
          <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!hasSelectedTickets}
          onClick={handleCheckout}
        >
          Continue to Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}