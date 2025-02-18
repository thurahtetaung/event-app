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

  const upcomingTickets = tickets.filter(({ event }) =>
    new Date(event.startTimestamp) > new Date()
  )
  const pastTickets = tickets.filter(({ event }) =>
    new Date(event.startTimestamp) <= new Date()
  )

  const handleDownloadTicket = async (ticket: Ticket) => {
    try {
      setIsDownloading(true)

      // Fetch access token if not already fetched
      const response = await apiClient.tickets.getAccessToken(
        ticket.event.id,
        ticket.ticket.id
      );

      // Create QR code
      const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/organizer/events/${ticket.event.id}/validate/${ticket.ticket.id}?accessToken=${response.accessToken}`

      // Create a temporary div to render the QR code
      const tempDiv = document.createElement('div')
      document.body.appendChild(tempDiv)

      // Render QR code into the temporary div
      const qrRoot = createRoot(tempDiv)
      qrRoot.render(
        <QRCodeSVG
          value={qrValue}
          size={256}
          level="H"
          includeMargin
        />
      )

      // Wait for QR code to render
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get the SVG element
      const svgElement = tempDiv.querySelector('svg')
      if (!svgElement) {
        throw new Error('Failed to render QR code')
      }

      // Create a canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions
      canvas.width = 800
      canvas.height = 1000

      // Set background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add ticket content
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'

      // Event title
      ctx.fillText(ticket.event.title, canvas.width/2, 50)

      // Ticket type
      ctx.font = '24px Arial'
      ctx.fillStyle = '#666666'
      ctx.fillText(ticket.ticketType.name, canvas.width/2, 90)

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create QR code image
      const qrImage = new Image()
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve
        qrImage.onerror = reject
        qrImage.src = svgUrl
      })

      // Draw QR code
      ctx.drawImage(qrImage, (canvas.width - 256) / 2, 120, 256, 256)

      // Event details
      ctx.font = '20px Arial'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      const startY = 420
      const lineHeight = 40

      // Organization
      if (ticket.event.organization?.name) {
        ctx.fillText(`Organized by: ${ticket.event.organization.name}`, canvas.width/2, startY)
      }

      // Date
      ctx.fillText(`Date: ${format(new Date(ticket.event.startTimestamp), "PPP")}`, canvas.width/2, startY + lineHeight)

      // Time
      ctx.fillText(
        `Time: ${format(new Date(ticket.event.startTimestamp), "h:mm a")} - ${format(new Date(ticket.event.endTimestamp), "h:mm a")}`,
        canvas.width/2,
        startY + lineHeight * 2
      )

      // Location
      const location = ticket.event.isOnline ? "Online Event" : ticket.event.venue || ticket.event.address
      ctx.fillText(`Location: ${location}`, canvas.width/2, startY + lineHeight * 3)

      // Ticket details box
      ctx.fillStyle = '#f5f5f5'
      const boxY = startY + lineHeight * 4
      ctx.fillRect(50, boxY, canvas.width - 100, 80)

      // Ticket ID and Access Token
      ctx.font = '16px monospace'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.fillText(`Ticket ID: ${ticket.ticket.id}`, canvas.width/2, boxY + 30)
      ctx.fillText(`Access Token: ${response.accessToken}`, canvas.width/2, boxY + 60)

      // Convert to PNG and download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `ticket-${ticket.ticket.id}.png`
      link.href = dataUrl
      link.click()

      // Cleanup
      URL.revokeObjectURL(svgUrl)
      document.body.removeChild(tempDiv)
      qrRoot.unmount()

    } catch (error) {
      console.error('Error downloading ticket:', error)
      setError(error instanceof Error ? error.message : 'Failed to download ticket')
    } finally {
      setIsDownloading(false)
    }
  }

  // const handleShareTicket = (ticketId: string) => {
  //   // In a real app, implement ticket sharing
  //   console.log("Sharing ticket:", ticketId)
  // }

  const handleViewQR = async (ticket: Ticket) => {
    try {
      setIsLoadingQR(true)
      setQrError(null)
      setSelectedTicket(ticket)
      setQrDialogOpen(true)

      // Fetch access token
      const response = await apiClient.tickets.getAccessToken(
        ticket.event.id,
        ticket.ticket.id
      );

      setAccessToken(response.accessToken)
    } catch (error) {
      console.error('Error fetching access token:', error)
      setQrError(error instanceof Error ? error.message : 'Failed to generate QR code')
    } finally {
      setIsLoadingQR(false)
    }
  }

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const isUpcoming = new Date(ticket.event.startTimestamp) > new Date()
    const location = ticket.event.isOnline
      ? "Online Event"
      : ticket.event.venue || ticket.event.address || "Location TBA"

    return (
      <Card className="group relative overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={isUpcoming ? "default" : "secondary"}
            >
              {isUpcoming ? "Upcoming" : "Past"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDownloadTicket(ticket)}
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Ticket'}
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => handleShareTicket(ticket.ticket.id)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Ticket
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => handleViewQR(ticket)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  View QR Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1.5">
            <CardTitle className="line-clamp-2 min-h-[3.5rem] text-xl">
              {ticket.event.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <span className="font-medium text-foreground">{ticket.ticketType.name}</span>
              <span>•</span>
              <span>{ticket.ticketType.type === 'free' ? 'Free' : `$${(ticket.ticket.price / 100).toFixed(2)}`}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          {ticket.event.organization?.name && (
            <div className="grid grid-cols-[20px_1fr] items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Organized by: {ticket.event.organization.name}</span>
            </div>
          )}
          <div className="grid grid-cols-[20px_1fr] items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(new Date(ticket.event.startTimestamp), "PPP")}</span>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              {format(new Date(ticket.event.startTimestamp), "h:mm a")} -{" "}
              {format(new Date(ticket.event.endTimestamp), "h:mm a")}
            </span>
          </div>
          <div className="grid grid-cols-[20px_1fr] items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 rounded-md bg-muted p-2 text-xs font-medium">
            <QrCode className="h-4 w-4" />
            <span className="font-mono">Ticket ID: {ticket.ticket.id}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
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
            ) : upcomingTickets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingTickets.map((ticket) => (
                  <TicketCard key={ticket.ticket.id} ticket={ticket} />
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
            ) : pastTickets.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastTickets.map((ticket) => (
                  <TicketCard key={ticket.ticket.id} ticket={ticket} />
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

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>
              Present this QR code at the event for entry
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col items-center justify-center space-y-4 p-6">
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_APP_URL}/organizer/events/${selectedTicket.event.id}/validate/${selectedTicket.ticket.id}?accessToken=${accessToken}`}
                size={256}
                level="H"
                includeMargin
                className="rounded-lg"
              />
              <div className="text-center">
                <p className="font-medium">{selectedTicket.event.title}</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.ticketType.name}</p>
                {selectedTicket.event.organization?.name && (
                  <p className="text-sm text-muted-foreground">Organized by: {selectedTicket.event.organization.name}</p>
                )}
                <p className="mt-2 text-xs font-mono text-muted-foreground">
                  Ticket ID: {selectedTicket.ticket.id}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}