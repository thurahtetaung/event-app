"use client"

import Link from "next/link"
import { CalendarDays, Users, ArrowRight, DollarSign, Clock, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface UpcomingEventsProps {
  events: Array<{
    id: string;
    title: string;
    startTimestamp: string;
    status: "draft" | "published" | "cancelled";
    ticketsSold: number;
    revenue: number;
  }>;
}

// Fallback data in case no events are provided
const fallbackEvents = [
  {
    id: "no-events",
    title: "No upcoming events",
    startTimestamp: new Date().toISOString(),
    ticketsSold: 0,
    revenue: 0,
    status: "draft" as const,
  }
]

export function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
  const displayEvents = events.length > 0 ? events : fallbackEvents;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {displayEvents.map((event) => {
          const eventDate = new Date(event.startTimestamp);
          const timeUntil = formatDistanceToNow(eventDate, { addSuffix: true });

          return (
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
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{timeUntil}</span>
                  <span className="px-2">•</span>
                    <span>{eventDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    <span>
                        {event.ticketsSold} tickets
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="mr-1 h-3 w-3" />
                      <span>
                        ${event.revenue.toFixed(2)}
                    </span>
                  </div>
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
                </div>
              </div>
            </div>
              {event.id !== "no-events" && (
                <div className="flex gap-2 shrink-0">
                  <Link href={`/organizer/events/${event.id}/validate`} className="shrink-0">
                    <Button variant="outline" size="icon" title="Validate Tickets">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="sr-only">Validate tickets</span>
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}`} className="shrink-0">
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">View event details</span>
                    </Button>
                  </Link>
                </div>
              )}
          </div>
          );
        })}
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

