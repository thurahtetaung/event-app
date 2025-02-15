"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Download, Share2, QrCode, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// This would come from your API in a real app
const SAMPLE_TICKETS: Ticket[] = [
  {
    id: "1",
    eventId: "1",
    eventTitle: "TAEYAND 2025 TOUR - [THE LIGHT YEAR] - ENCORE",
    ticketType: "VIP",
    date: "2025-04-20",
    time: "6:00 PM - 9:00 PM",
    location: "125 Siam Avenue, Britton Rouge",
    price: 100,
    quantity: 2,
    status: "upcoming", // upcoming, completed, cancelled
    ticketCode: "VIP-123-456",
    imageUrl: "/placeholder.jpg",
  },
  {
    id: "2",
    eventId: "2",
    eventTitle: "Web3 Developer Conference 2025",
    ticketType: "Early Bird",
    date: "2025-04-25",
    time: "9:00 AM - 6:00 PM",
    location: "Bangkok Convention Center",
    price: 250,
    quantity: 1,
    status: "upcoming",
    ticketCode: "EB-789-012",
    imageUrl: "/placeholder.jpg",
  },
  {
    id: "3",
    eventId: "3",
    eventTitle: "Thai Food Festival 2025",
    ticketType: "General Admission",
    date: "2024-12-27",
    time: "11:00 AM - 10:00 PM",
    location: "Lumpini Park, Bangkok",
    price: 0,
    quantity: 4,
    status: "completed",
    ticketCode: "GA-345-678",
    imageUrl: "/placeholder.jpg",
  },
]

interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  ticketType: string
  date: string
  time: string
  location: string
  price: number
  quantity: number
  status: "upcoming" | "completed" | "cancelled"
  ticketCode: string
  imageUrl: string
}

export default function MyEventsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // In a real app, fetch from your API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTickets(SAMPLE_TICKETS)
      } catch (error) {
        console.error("Failed to fetch tickets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const upcomingTickets = tickets.filter(ticket => ticket.status === "upcoming")
  const pastTickets = tickets.filter(ticket => ticket.status === "completed")

  const handleDownloadTicket = (ticketId: string) => {
    // In a real app, implement ticket PDF download
    console.log("Downloading ticket:", ticketId)
  }

  const handleShareTicket = (ticketId: string) => {
    // In a real app, implement ticket sharing
    console.log("Sharing ticket:", ticketId)
  }

  const handleViewQR = (ticketId: string) => {
    // In a real app, show QR code modal
    console.log("Viewing QR code for ticket:", ticketId)
  }

  const handleTransferTicket = (ticketId: string) => {
    // In a real app, implement ticket transfer
    console.log("Transferring ticket:", ticketId)
  }

  const handleCancelTicket = (ticketId: string) => {
    // In a real app, implement ticket cancellation
    console.log("Cancelling ticket:", ticketId)
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={ticket.status === "upcoming" ? "default" : "secondary"}
          >
            {ticket.status === "upcoming" ? "Upcoming" : "Past"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownloadTicket(ticket.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareTicket(ticket.id)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Ticket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewQR(ticket.id)}>
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </DropdownMenuItem>
              {ticket.status === "upcoming" && (
                <>
                  <Separator className="my-2" />
                  <DropdownMenuItem onClick={() => handleTransferTicket(ticket.id)}>
                    Transfer Ticket
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCancelTicket(ticket.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Cancel Ticket
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="line-clamp-2 min-h-[3.5rem] text-xl">
            {ticket.eventTitle}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <span className="font-medium text-foreground">{ticket.ticketType}</span>
            <span>•</span>
            <span>{ticket.quantity} {ticket.quantity === 1 ? "ticket" : "tickets"}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <div className="grid grid-cols-[20px_1fr] items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{format(new Date(ticket.date), "PPP")}</span>
        </div>
        <div className="grid grid-cols-[20px_1fr] items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>{ticket.time}</span>
        </div>
        <div className="grid grid-cols-[20px_1fr] items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="line-clamp-1">{ticket.location}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 rounded-md bg-muted p-2 text-xs font-medium">
          <QrCode className="h-4 w-4" />
          <span className="font-mono">Ticket Code: {ticket.ticketCode}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">
          Manage your event tickets and registrations
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastTickets.length})
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
          ) : upcomingTickets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-lg font-medium">No upcoming events</p>
                <p className="text-sm text-muted-foreground">
                  When you register for events, they will appear here
                </p>
                <Button className="mt-4" variant="outline">
                  Browse Events
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
          ) : pastTickets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
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
  )
}