"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Download, Share2, QrCode, MoreHorizontal, Building2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { apiClient } from "@/lib/api-client"
import { QRCodeSVG } from "qrcode.react"

import ReactDOMServer from "react-dom/server"
import { createRoot } from "react-dom/client"
import Link from "next/link"

interface Ticket {
  ticket: {
    id: string;
    status: string;
    price: number;
    bookedAt?: string;
  };
  event: {
    id: string;
    title: string;
    startTimestamp: string;
    endTimestamp: string;
    venue: string | null;
    address: string | null;
    isOnline: boolean;
    coverImage?: string;
    organization?: {
      name: string;
    };
  };
  ticketType: {
    id: string;
    name: string;
    type: 'paid' | 'free';
  };
}

export default function MyEventsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.tickets.getMyTickets()
        setTickets(data)
      } catch (error) {
        console.error("Failed to fetch tickets:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch tickets")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Group tickets by event
  const groupTicketsByEvent = (tickets: Ticket[]) => {
    const eventMap = new Map<string, { event: Ticket['event'], tickets: Ticket[] }>();

    tickets.forEach(ticket => {
      const eventId = ticket.event.id;
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          event: ticket.event,
          tickets: []
        });
      }
      eventMap.get(eventId)?.tickets.push(ticket);
    });

    return Array.from(eventMap.values());
  };

  const upcomingTickets = tickets.filter(({ event }) =>
    new Date(event.startTimestamp) > new Date()
  );

  const pastTickets = tickets.filter(({ event }) =>
    new Date(event.startTimestamp) <= new Date()
  );

  // Group tickets by event
  const upcomingEvents = groupTicketsByEvent(upcomingTickets);
  const pastEvents = groupTicketsByEvent(pastTickets);

  // Simplified EventCard component that links to the event's tickets page
  const EventCard = ({ event, tickets }: { event: Ticket['event'], tickets: Ticket[] }) => {
    return (
      <Card className="mb-6 hover:shadow-md transition-shadow">
        <Link href={`/my-events/${event.id}`} className="block">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  {event.organization?.name && (
                    <>
                      <Building2 className="h-3 w-3" />
                      <span>{event.organization.name}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={new Date(event.startTimestamp) > new Date() ? "outline" : "secondary"}>
                {new Date(event.startTimestamp) > new Date() ? "Upcoming" : "Past"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.startTimestamp), "EEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.startTimestamp), "h:mm a")} - {format(new Date(event.endTimestamp), "h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.isOnline ? "Online Event" : event.venue || event.address || "Location TBA"}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </div>
              <Button size="sm" variant="outline" className="pointer-events-none">
                View Tickets
              </Button>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="text-muted-foreground">
            View events you've registered for
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-[300px] rounded-lg border border-border/40 bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="text-lg font-medium text-destructive">{error}</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map(({ event, tickets }) => (
                  <EventCard key={event.id} event={event} tickets={tickets} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="text-lg font-medium">No upcoming events</p>
                  <p className="text-sm text-muted-foreground">
                    When you register for events, they will appear here
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <a href="/events">Browse Events</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-[300px] rounded-lg border border-border/40 bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="text-lg font-medium text-destructive">{error}</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : pastEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map(({ event, tickets }) => (
                  <EventCard key={event.id} event={event} tickets={tickets} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="text-lg font-medium">No past events</p>
                  <p className="text-sm text-muted-foreground">
                    Your event history will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}