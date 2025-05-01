import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { format } from "date-fns"
import type { Event } from "@/lib/api-client"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  if (!event) {
    return null;
  }

  // Sort ticket types by price and get the lowest price
  const sortedTickets = [...(event.ticketTypes || [])].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedTickets[0]?.price || 0;

  const location = event.isOnline ? 'Online Event' : event.venue || event.address || 'Location TBA'
  const organizerName = event.organization?.name || 'Event Organizer'

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card transition-all hover:border-primary/20 hover:shadow-md">
      <Link href={`/events/${event.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={event.coverImage || '/placeholder.jpg'}
            alt={event.title}
            width={400}
            height={225}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="badge-primary absolute left-3 top-3">
            {event.categoryObject?.name || 'Uncategorized'}
          </Badge>
        </div>
        <CardContent className="flex-1 space-y-2.5 border-t border-border/40 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-card-foreground">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground">Organized by {organizerName}</p>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(event.startTimestamp), 'dd MMMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{`${format(new Date(event.startTimestamp), 'h:mm a')} - ${format(new Date(event.endTimestamp), 'h:mm a')}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 p-4">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="font-medium text-card-foreground">
              {lowestPrice === 0 ? "Free" : `$${lowestPrice.toLocaleString()}`}
            </div>
            <Button className="btn-primary">Buy Ticket</Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}