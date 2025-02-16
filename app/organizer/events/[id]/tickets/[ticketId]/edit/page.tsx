"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TicketForm } from "@/components/organizer/TicketForm"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { Event, TicketType } from "@/types"
import { Loader2 } from "lucide-react"

export default function EditTicketPage({
  params
}: {
  params: { id: string; ticketId: string }
}) {
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    async function fetchTicket() {
      try {
        const event = await apiClient.events.getById(params.id) as Event
        if (!isMounted) return;

        const ticketType = event.ticketTypes.find((t: TicketType) => t.id === params.ticketId)
        if (!ticketType) {
          toast.error("Ticket type not found")
          router.push(`/organizer/events/${params.id}`)
          return
        }
        setTicket(ticketType)
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof Error && !error.message.includes('Request was cancelled')) {
          console.error("Error fetching ticket:", error)
          toast.error("Failed to load ticket details")
          router.push(`/organizer/events/${params.id}`)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTicket()

    return () => {
      isMounted = false
    }
  }, [params.id, params.ticketId, router])

  const handleSuccess = () => {
    toast.success("Ticket type updated successfully")
    router.push(`/organizer/events/${params.id}`)
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!ticket) return null

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container py-8">
          <div className="mx-auto max-w-5xl">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.back()}
              type="button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Ticket Type</h1>
            <TicketForm
              eventId={params.id}
              initialData={{
                id: ticket.id,
                name: ticket.name,
                description: ticket.description,
                price: ticket.price,
                quantity: ticket.quantity,
                saleStartDate: new Date(ticket.saleStart),
                saleEndDate: new Date(ticket.saleEnd),
                maximumPurchase: ticket.maxPerOrder,
                minimumPurchase: ticket.minPerOrder
              }}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  )
}