"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Event {
  id: string
  title: string
  startTimestamp: string
  status: 'draft' | 'published' | 'cancelled'
  ticketsSold: number
}

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    async function fetchEvents() {
      try {
        const data = await apiClient.events.getMyEvents()
        if (isMounted) {
          setEvents(data as Event[])
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Request was cancelled')) {
          console.error('Error fetching events:', error)
          toast.error('Failed to load events')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchEvents()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <Button asChild>
            <Link href="/organizer/events/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        <Button asChild>
          <Link href="/organizer/events/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
          <Button asChild>
            <Link href="/organizer/events/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Event
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tickets Sold</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{format(new Date(event.startTimestamp), "PPP")}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      event.status === "published"
                        ? "success"
                        : event.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>{event.ticketsSold}</TableCell>
                <TableCell className="space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/organizer/events/${event.id}`}>Edit</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/organizer/events/${event.id}/analytics`}>Analytics</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

