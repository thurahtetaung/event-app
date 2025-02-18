"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Share2, Building2, Facebook, Instagram, Twitter, Linkedin, Globe, Users } from "lucide-react"
import { TicketSelection } from "@/components/events/TicketSelection"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { format } from "date-fns"
import { useEffect, useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { EventSlider } from "@/components/events/EventSlider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ImageIcon } from "lucide-react"
import { Event } from "@/lib/api-client"

interface Organization {
  id: string;
  name: string;
  website?: string;
  socialLinks?: string;
}

interface EventPageProps {
  params: {
    id: string
  }
}

function getStatusVariant(status: "draft" | "published" | "cancelled"): "default" | "secondary" | "destructive" {
  switch (status) {
    case "published":
      return "default"
    case "draft":
      return "secondary"
    case "cancelled":
      return "destructive"
  }
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [similarEvents, setSimilarEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    let isCancelled = false;

    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.events.getById(params.id)
      if (!isCancelled) {
        setEvent(data)

        // Fetch similar events in the same category
        const similar = await apiClient.events.getPublicEvents({
          category: data.category,
          sort: "date"
        })
        if (!isCancelled) {
          setSimilarEvents(similar)
        }
      }
    } catch (error: any) {
      // Ignore cancelled requests
      if (error.message === 'Request was cancelled' || isCancelled) {
        return;
      }
      console.error("Failed to fetch event:", error)
      if (!isCancelled) {
        setError(error.message || "Failed to load event details")
      }
    } finally {
      if (!isCancelled) {
        setIsLoading(false)
      }
    }

    return () => {
      isCancelled = true;
    }
  }, [params.id])

  useEffect(() => {
    const cleanupFn = fetchEvent();

    return () => {
      // Handle the Promise returned by fetchEvent
      cleanupFn.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [fetchEvent])

  if (isLoading) {
    return (
      <div className="container pb-10">
        <Skeleton className="h-[500px] w-full rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error || "Event not found"}</p>
          <div className="mt-4 space-x-4">
            <Button onClick={fetchEvent}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const location = event.isOnline ? "Online Event" : event.venue || event.address || "Location TBA"

  const renderOrganizer = () => {
    if (!event?.organization) return null;

    let socialLinks: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; } = {};
    try {
      if (event.organization.socialLinks) {
        socialLinks = JSON.parse(event.organization.socialLinks);
      }
    } catch (error) {
      console.error('Error parsing social links:', error);
    }

    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">{event.organization.name}</h3>
              <p className="text-sm text-gray-500">Event Organizer</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {event.organization.website && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={event.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Globe className="h-5 w-5 text-gray-600" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit website</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {socialLinks.facebook && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-gray-600" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {socialLinks.instagram && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-gray-600" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {socialLinks.twitter && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-gray-600" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {socialLinks.linkedin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-gray-600" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Event Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <Badge variant="secondary" className="text-sm">
              {event.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Event Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              {event.coverImage ? (
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Event Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">About this event</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Similar Events */}
            {similarEvents.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Similar Events</h2>
                <EventSlider events={similarEvents} currentEventId={event.id} />
              </div>
            )}
          </div>

          {/* Right Column - Event Details & Tickets */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card className="p-6 space-y-6">
              {/* Date & Time */}
              <div className="flex items-start space-x-4">
                <Calendar className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="font-medium">Date and time</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startTimestamp), "EEE, MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startTimestamp), "h:mm a")} -{" "}
                    {format(new Date(event.endTimestamp), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-gray-600">{location}</p>
                  {event.address && <p className="text-sm text-gray-600">{event.address}</p>}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start space-x-4">
                <Users className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="font-medium">Capacity</h3>
                  <p className="text-sm text-gray-600">{event.capacity} attendees</p>
                </div>
              </div>
            </Card>

            {/* Organizer */}
            {renderOrganizer()}

            {/* Ticket Selection */}
            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <TicketSelection
                eventId={event.id}
                ticketTypes={event.ticketTypes.filter((t): t is (typeof t & { status: 'on-sale' | 'paused' | 'sold-out' | 'scheduled' }) =>
                  t.status !== undefined
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

