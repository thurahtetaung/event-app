"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, Ticket, Globe, AlertCircle, Plus, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TicketForm } from "@/components/organizer/TicketForm"
import { EventSettings } from "@/components/organizer/EventSettings"

// Mock data - replace with your API call
const event = {
  id: "1",
  title: "Tech Conference 2024",
  description: "A conference bringing together tech leaders and innovators",
  date: "2024-06-15",
  time: "09:00 AM",
  location: "Convention Center, City",
  capacity: 1000,
  ticketsSold: 150,
  status: "draft",
  isPublic: true,
  requiresApproval: false,
  tickets: [
    {
      id: "1",
      name: "Super Early Bird",
      price: 99,
      quantity: 100,
      sold: 100,
      status: "sold-out",
    },
    {
      id: "2",
      name: "Early Bird",
      price: 149,
      quantity: 200,
      sold: 50,
      status: "on-sale",
    },
    {
      id: "3",
      name: "Regular",
      price: 199,
      quantity: 400,
      sold: 0,
      status: "scheduled",
    },
    {
      id: "4",
      name: "VIP",
      price: 499,
      quantity: 50,
      sold: 0,
      status: "on-sale",
    }
  ],
}

export default function EventDetailPage() {
  const params = useParams()
  const [isPublishing, setIsPublishing] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(event.status)
  const [editingTicket, setEditingTicket] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // In a real app, make API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCurrentStatus("published")
      toast.success("Event published successfully")
    } catch (error) {
      console.error("Error publishing event:", error)
      toast.error("Failed to publish event")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleTicketStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      // In a real app, make API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Ticket status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating ticket status:", error)
      toast.error("Failed to update ticket status")
    }
  }

  const handleEditTicket = (ticket: any) => {
    setEditingTicket(ticket)
    setIsDialogOpen(true)
  }

  const handleCreateTicket = () => {
    setEditingTicket(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        {currentStatus === "draft" && (
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish Event"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.date}</div>
            <p className="text-xs text-muted-foreground">{event.time}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.location}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.capacity}</div>
            <p className="text-xs text-muted-foreground">
              {event.ticketsSold} tickets sold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                currentStatus === "published"
                  ? "success"
                  : currentStatus === "draft"
                  ? "outline"
                  : "default"
              }
            >
              {currentStatus}
            </Badge>
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateTicket}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ticket Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingTicket ? 'Edit Ticket Type' : 'Create Ticket Type'}</DialogTitle>
                      <DialogDescription>
                        {editingTicket ? 'Modify the details of this ticket type.' : 'Add a new ticket type to your event.'}
                      </DialogDescription>
                    </DialogHeader>
                    <TicketForm
                      initialData={editingTicket}
                      onSuccess={() => setIsDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto rounded-md border p-4">
                {event.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between space-x-4 rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{ticket.name}</h3>
                        <Badge
                          variant={ticket.status === "on-sale" ? "success" : "outline"}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${ticket.price} • {ticket.sold}/{ticket.quantity} sold
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit ticket</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleTicketStatusChange(
                            ticket.id,
                            ticket.status === "on-sale" ? "paused" : "on-sale"
                          )
                        }
                      >
                        {ticket.status === "on-sale" ? "Pause Sales" : "Start Sales"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <EventSettings
                event={{
                  ...event,
                  date: new Date(event.date),
                  time: {
                    hour: event.time.split(" ")[0].split(":")[0],
                    minute: event.time.split(" ")[0].split(":")[1]
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}