"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { CalendarIcon, Clock, MapPin, Upload, X, Plus, Trash2, DollarSign, Users, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TicketType {
  id: string
  name: string
  price: string
  quantity: string
  description: string
  type: "paid" | "free"
  saleStart: string
  saleEnd: string
  maxPerOrder: string
}

interface EventDetails {
  title: string
  description: string
  date: Date | undefined
  time: {
    hour: string
    minute: string
  }
  venue: string
  address: string
  category: string
  isOnline: boolean
  coverImage?: File
  isPrivate: boolean
  requireApproval: boolean
}

const EVENT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Concert",
  "Exhibition",
  "Sports",
  "Networking",
  "Other",
]

export function EventCreationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: "",
    description: "",
    date: undefined,
    time: {
      hour: "12",
      minute: "00"
    },
    venue: "",
    address: "",
    category: "",
    isOnline: false,
    isPrivate: false,
    requireApproval: false,
  })
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: "1",
      name: "",
      price: "",
      quantity: "",
      description: "",
      type: "paid",
      saleStart: "",
      saleEnd: "",
      maxPerOrder: "",
    },
  ])
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        name: "",
        price: "",
        quantity: "",
        description: "",
        type: "paid",
        saleStart: "",
        saleEnd: "",
        maxPerOrder: "",
      },
    ])
  }

  const removeTicketType = (id: string) => {
    if (ticketTypes.length === 1) return
    setTicketTypes((prev) => prev.filter((ticket) => ticket.id !== id))
  }

  const updateTicketType = (
    id: string,
    field: keyof TicketType,
    value: string | "paid" | "free"
  ) => {
    setTicketTypes((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    )
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEventDetails((prev) => ({ ...prev, coverImage: file }))
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate event date is in the future
      const eventDate = new Date(eventDetails.date?.toISOString() || "")
      if (eventDate <= new Date()) {
        toast.error("Event date must be in the future")
        return
      }

      // Validate ticket sale dates
      for (const ticket of ticketTypes) {
        const saleStart = new Date(ticket.saleStart)
        const saleEnd = new Date(ticket.saleEnd)
        if (saleEnd <= saleStart) {
          toast.error("Ticket sale end date must be after start date")
          return
        }
        if (saleEnd > eventDate) {
          toast.error("Ticket sales must end before event starts")
          return
        }
      }

      // In a real app, you would submit to an API here
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Event created successfully!")
      router.push("/organizer/events")
    } catch (error) {
      toast.error("Failed to create event")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container max-w-5xl mx-auto space-y-8 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
              {coverImagePreview ? (
                <div className="group relative h-full">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEventDetails((prev) => ({ ...prev, coverImage: undefined }))
                        setCoverImagePreview("")
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventDetails.title}
                onChange={(e) =>
                  setEventDetails((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={eventDetails.category}
                onValueChange={(value) =>
                  setEventDetails((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={eventDetails.description}
              onChange={(e) =>
                setEventDetails((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[150px]"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDetails.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDetails.date ? (
                      format(eventDetails.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDetails.date}
                    onSelect={(date) =>
                      setEventDetails((prev) => ({ ...prev, date }))
                    }
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Event Time</Label>
              <div className="flex gap-2">
                <Select
                  value={eventDetails.time.hour}
                  onValueChange={(hour) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      time: { ...prev.time, hour },
                    }))
                  }
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent className="h-[200px]">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, "0")
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <span className="flex items-center">:</span>
                <Select
                  value={eventDetails.time.minute}
                  onValueChange={(minute) =>
                    setEventDetails((prev) => ({
                      ...prev,
                      time: { ...prev.time, minute },
                    }))
                  }
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {["00", "15", "30", "45"].map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="isOnline" className="text-sm">Online Event</Label>
                <Switch
                  id="isOnline"
                  checked={eventDetails.isOnline}
                  onCheckedChange={(checked) =>
                    setEventDetails((prev) => ({ ...prev, isOnline: checked }))
                  }
                />
              </div>
            </div>
            {!eventDetails.isOnline && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name</Label>
                  <Input
                    id="venue"
                    value={eventDetails.venue}
                    onChange={(e) =>
                      setEventDetails((prev) => ({ ...prev, venue: e.target.value }))
                    }
                    required={!eventDetails.isOnline}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={eventDetails.address}
                    onChange={(e) =>
                      setEventDetails((prev) => ({ ...prev, address: e.target.value }))
                    }
                    required={!eventDetails.isOnline}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Event Settings */}
          <div className="space-y-4">
            <Label>Event Settings</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <TooltipProvider>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPrivate">Private Event</Label>
                    <div className="text-sm text-muted-foreground">
                      Only visible to invited attendees
                    </div>
                  </div>
                  <Switch
                    id="isPrivate"
                    checked={eventDetails.isPrivate}
                    onCheckedChange={(checked) =>
                      setEventDetails((prev) => ({ ...prev, isPrivate: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="requireApproval">Require Approval</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manually approve each registration</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Review attendees before confirming
                    </div>
                  </div>
                  <Switch
                    id="requireApproval"
                    checked={eventDetails.requireApproval}
                    onCheckedChange={(checked) =>
                      setEventDetails((prev) => ({ ...prev, requireApproval: checked }))
                    }
                  />
                </div>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Ticket Types</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTicketType}
              disabled={ticketTypes.length >= 5}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket Type
            </Button>
          </div>

          <div className="space-y-6">
            {ticketTypes.map((ticket, index) => (
              <Card key={ticket.id}>
                <CardContent className="pt-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h4 className="font-medium">Ticket Type {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTicketType(ticket.id)}
                      disabled={ticketTypes.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="grid gap-6">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Ticket Name</Label>
                        <Input
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicketType(ticket.id, "name", e.target.value)
                          }
                          placeholder="e.g., Early Bird, VIP, General"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ticket Type</Label>
                        <RadioGroup
                          value={ticket.type}
                          onValueChange={(value: "paid" | "free") =>
                            updateTicketType(ticket.id, "type", value)
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id={`paid-${ticket.id}`} />
                            <Label htmlFor={`paid-${ticket.id}`}>Paid</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id={`free-${ticket.id}`} />
                            <Label htmlFor={`free-${ticket.id}`}>Free</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {ticket.type === "paid" && (
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={ticket.price}
                              onChange={(e) =>
                                updateTicketType(ticket.id, "price", e.target.value)
                              }
                              className="pl-8"
                              required={ticket.type === "paid"}
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Quantity Available</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) =>
                              updateTicketType(ticket.id, "quantity", e.target.value)
                            }
                            className="pl-8"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={ticket.description}
                        onChange={(e) =>
                          updateTicketType(ticket.id, "description", e.target.value)
                        }
                        placeholder="What's included with this ticket?"
                        required
                      />
                    </div>

                    {/* Sale Period */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Sale Start Date</Label>
                        <Input
                          type="datetime-local"
                          value={ticket.saleStart}
                          onChange={(e) =>
                            updateTicketType(ticket.id, "saleStart", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sale End Date</Label>
                        <Input
                          type="datetime-local"
                          value={ticket.saleEnd}
                          onChange={(e) =>
                            updateTicketType(ticket.id, "saleEnd", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Max Tickets Per Order */}
                    <div className="space-y-2">
                      <Label>Maximum Tickets Per Order</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ticket.maxPerOrder}
                        onChange={(e) =>
                          updateTicketType(ticket.id, "maxPerOrder", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  )
}