"use client"

import Link from "next/link"
import { CalendarDays, Users, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// In a real app, this would be fetched from an API
const events = [
  {
    id: "1",
    title: "Tech Conference 2024",
    date: "March 15, 2024",
    time: "9:00 AM",
    location: "Convention Center",
    ticketsSold: 245,
    capacity: 500,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Music Festival",
    date: "April 1, 2024",
    time: "4:00 PM",
    location: "City Park",
    ticketsSold: 890,
    capacity: 1000,
    status: "on-sale",
  },
  {
    id: "3",
    title: "Business Workshop",
    date: "April 10, 2024",
    time: "10:00 AM",
    location: "Business Center",
    ticketsSold: 48,
    capacity: 100,
    status: "draft",
  },
]

export function UpcomingEvents() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-muted p-2">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{event.title}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{event.date}</span>
                  <span className="px-2">•</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    <span>
                      {event.ticketsSold}/{event.capacity}
                    </span>
                  </div>
                  <Badge
                    variant={
                      event.status === "on-sale"
                        ? "success"
                        : event.status === "draft"
                        ? "outline"
                        : "default"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Link href={`/organizer/events/${event.id}`} className="shrink-0">
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">View event details</span>
              </Button>
            </Link>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/organizer/events">
          View All Events
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

