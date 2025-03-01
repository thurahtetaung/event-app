"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, Ticket, Globe, AlertCircle, Plus, Pencil } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { apiClient } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EventSettings } from "@/components/organizer/EventSettings"

interface Event {
  id: string
  title: string
  description: string
  startTimestamp: string
  endTimestamp: string
  venue: string | null
  address: string | null
  categoryId: string
  categoryObject?: {
    id: string
    name: string
    icon: string
  }
  isOnline: boolean
  capacity: number
  status: "draft" | "published" | "cancelled"
  ticketTypes: TicketType[]
  ticketsSold: number
  coverImage?: string
  organizationId: string
}

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  type: string
  saleStart: string
  saleEnd: string
  maxPerOrder: number
  minPerOrder: number
  status: "on-sale" | "paused" | "sold-out" | "scheduled"
  soldCount: number
}

interface TicketFormData {
  id?: string
  name: string
  description?: string
  price: number
  quantity: number
  saleStartDate?: Date
  saleEndDate?: Date
  maxPerOrder: number
  minPerOrder: number
  type: string
  allowWaitlist: boolean
}

interface EventSettingsData {
  id: string
  title: string
  description: string
  date: Date
  startTime: {
    hour: string
    minute: string
  }
  endTime: {
    hour: string
    minute: string
  }
  location: string
  capacity: number
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    let isMounted = true;

    async function fetchEvent() {
      try {
        const data = await apiClient.events.getById(params.id as string)
        if (isMounted) {
          setEvent(data as Event)
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Request was cancelled')) {
          console.error("Error fetching event:", error)
          toast.error("Failed to load event details")
          router.push("/organizer/events")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchEvent()

    return () => {
      isMounted = false
    }
  }, [params.id, router])

  const handleStatusChange = async (newStatus: "draft" | "published" | "cancelled") => {
    if (!event) return

    setIsStatusUpdating(true)
    try {
      await apiClient.events.updateStatus(event.id, {
        status: newStatus
      })
      // Fetch fresh event data after status update
      const updatedEvent = await apiClient.events.getById(event.id)
      setEvent(updatedEvent as Event)
      toast.success(`Event ${newStatus === "published" ? "published" : newStatus === "draft" ? "unpublished" : "cancelled"} successfully`)
    } catch (error) {
      console.error(`Error updating event status:`, error)
      toast.error(`Failed to ${newStatus === "published" ? "publish" : newStatus === "draft" ? "unpublish" : "cancel"} event`)
    } finally {
      setIsStatusUpdating(false)
    }
  }

  const handleEditTicket = (ticket: TicketType) => {
    if (!event) return
    router.push(`/organizer/events/${event.id}/tickets/${ticket.id}/edit`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  const startTime = new Date(event.startTimestamp)
  const endTime = new Date(event.endTimestamp)

  return (
    <div className="flex-1 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {event.status === "draft" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isStatusUpdating}>
                  Publish Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will make your event visible to the public. Are you sure you want to publish this event?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange("published")}
                    disabled={isStatusUpdating}
                  >
                    {isStatusUpdating ? "Publishing..." : "Publish Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {event.status === "published" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isStatusUpdating}>
                    Unpublish
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unpublish Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide your event from the public. Ticket sales will be paused. Are you sure you want to unpublish this event?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusChange("draft")}
                      disabled={isStatusUpdating}
                    >
                      {isStatusUpdating ? "Unpublishing..." : "Unpublish Event"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isStatusUpdating}>
                    Cancel Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your event and notify all ticket holders. This action cannot be undone. Are you sure you want to cancel this event?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusChange("cancelled")}
                      disabled={isStatusUpdating}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isStatusUpdating ? "Cancelling..." : "Cancel Event"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {event.status === "cancelled" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isStatusUpdating}>
                  Reactivate Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reactivate Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reactivate your event as a draft. You'll need to publish it again to make it visible to the public. Are you sure you want to reactivate this event?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleStatusChange("draft")}
                    disabled={isStatusUpdating}
                  >
                    {isStatusUpdating ? "Reactivating..." : "Reactivate Event"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(startTime, "PPP")}</div>
            <p className="text-xs text-muted-foreground">
              {format(startTime, "p")} - {format(endTime, "p")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            {event.isOnline ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.isOnline ? "Online Event" : event.venue}
            </div>
            <p className="text-xs text-muted-foreground">
              {event.isOnline ? "Virtual meeting details will be shared with attendees" : event.address}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {event.ticketTypes.reduce((total, ticket) => total + (ticket.quantity - ticket.soldCount), 0)} available
            </div>
            <p className="text-xs text-muted-foreground">
              {event.ticketTypes.length === 0
                ? "No ticket types"
                : event.ticketTypes.length === 1
                  ? "1 ticket type"
                  : `${event.ticketTypes.length} ticket types`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  event.status === "published"
                    ? "success"
                    : event.status === "draft"
                    ? "outline"
                    : "destructive"
                }
              >
                {event.status}
              </Badge>
              {event.status === "draft" && (
                <span className="text-xs text-muted-foreground">
                  Not visible to public
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {event.status === "published"
                ? `Capacity: ${event.capacity} attendees`
                : event.status === "draft"
                ? "Publish to start selling tickets"
                : "Event has been cancelled"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>
            Manage your event details, tickets, and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tickets" className="space-y-4">
            <TabsList className="sticky top-0 bg-background z-10">
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex items-center justify-between sticky top-12 bg-background z-10 py-4">
                <div>
                  <h3 className="text-lg font-medium">Ticket Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your event's ticket types
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/organizer/events/${event.id}/tickets/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ticket Type
                  </Link>
                </Button>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto rounded-md border p-4">
                {event.ticketTypes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Ticket Types Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-4">
                      Get started by creating ticket types for your event. You can set different prices, quantities, and sale periods to offer various options to your attendees.
                    </p>
                    <p className="text-sm text-primary">
                      Click the "Add Ticket Type" button above to create your first ticket type.
                    </p>
                  </div>
                ) : (
                  event.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{ticket.name}</h3>
                          <Badge
                            variant={
                              ticket.status === "on-sale"
                                ? "success"
                                : ticket.status === "sold-out"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.type === "free" ? (
                            <>Free • {ticket.soldCount}/{ticket.quantity} sold</>
                          ) : (
                            <>${ticket.price} • {ticket.soldCount}/{ticket.quantity} sold</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleEditTicket(ticket)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit ticket</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <EventSettings
                event={event}
                onSuccess={(updatedEvent) => {
                  if (!event) return;
                  setEvent({
                    ...event,
                    ...updatedEvent,
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}