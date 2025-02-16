"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TicketForm } from "@/components/organizer/TicketForm"
import { toast } from "sonner"

export default function CreateTicketPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const handleSuccess = () => {
    toast.success("Ticket type created successfully")
    router.push(`/organizer/events/${params.id}`)
    router.refresh()
  }

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
            <h1 className="text-3xl font-bold tracking-tight mb-8">Create Ticket Type</h1>
            <TicketForm eventId={params.id} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  )
}