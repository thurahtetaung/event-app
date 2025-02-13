"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Ticket {
  id: number
  type: string
  price: number
  available: number
}

interface Event {
  id: number
  title: string
  date: string
  description: string
  tickets: Ticket[]
}

export default function EventDetails({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<{ [key: number]: number }>({})
  const router = useRouter()

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/tickets`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data)
        } else {
          console.error("Failed to fetch event details")
        }
      } catch (error) {
        console.error("Error fetching event details:", error)
      }
    }

    fetchEventDetails()
  }, [eventId])

  const handleSeatSelection = (ticketId: number, count: number) => {
    if (count === 0) {
      const { [ticketId]: _, ...rest } = selectedSeats
      setSelectedSeats(rest)
    } else {
      setSelectedSeats({ ...selectedSeats, [ticketId]: count })
    }
  }

  const totalSelectedSeats = Object.values(selectedSeats).reduce((sum, count) => sum + count, 0)

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, selectedSeats }),
      })
      if (response.ok) {
        const { url } = await response.json()
        router.push(url)
      } else {
        console.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    }
  }

  if (!event) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-xl">{new Date(event.date).toLocaleDateString()}</p>
      <p>{event.description}</p>
      <Accordion type="single" collapsible className="w-full">
        {event.tickets.map((ticket) => (
          <AccordionItem value={`ticket-${ticket.id}`} key={ticket.id}>
            <AccordionTrigger>
              {ticket.type} - ${ticket.price.toFixed(2)}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center justify-between">
                <span>Available: {ticket.available}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeatSelection(ticket.id, Math.max((selectedSeats[ticket.id] || 0) - 1, 0))}
                    disabled={!selectedSeats[ticket.id]}
                  >
                    -
                  </Button>
                  <span>{selectedSeats[ticket.id] || 0}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSeatSelection(ticket.id, Math.min((selectedSeats[ticket.id] || 0) + 1, ticket.available))
                    }
                    disabled={totalSelectedSeats >= 6 || (selectedSeats[ticket.id] || 0) >= ticket.available}
                  >
                    +
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex justify-between items-center">
        <span>Total seats selected: {totalSelectedSeats}</span>
        <Button onClick={handleCheckout} disabled={totalSelectedSeats === 0}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}

