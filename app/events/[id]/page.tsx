import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPinIcon, ShareIcon, UserIcon, CheckCircle2 } from "lucide-react"
import { TicketSelection } from "@/components/events/TicketSelection"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { EventSlider } from "@/components/events/EventSlider"

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  // In a real app, fetch event data here using the id
  const event = {
    id: params.id,
    title: "TAEYANG 2025 TOUR [THE LIGHT YEAR] ENCORE",
    date: "Tuesday, July 8",
    time: "8pm - 5pm GMT+7",
    location: {
      venue: "The Landmark Bangkok",
      address: "138 Sukhumvit Road Khet Khlong Toei, Krung Thep Maha Nakhon 10110 Thailand",
    },
    imageUrl: "/placeholder.jpg",
    description: "Experience an unforgettable evening with TAEYANG as he returns to Bangkok for his encore performance. This spectacular show promises to deliver his biggest hits and newest releases in an immersive concert experience.",
    organizer: {
      name: "Eurasia Research",
      image: "/placeholder.jpg",
      eventsCount: 48,
      verified: true,
    },
    tags: ["Concert", "K-Pop", "Live Music", "Entertainment"],
    ticketTypes: [
      {
        id: "vip",
        name: "VIP Package",
        price: 299.99,
        description: "Front row seating with exclusive merchandise",
        available: 50,
      },
      {
        id: "standard",
        name: "Standard Admission",
        price: 99.99,
        description: "General admission seating",
        available: 200,
      },
    ],
    similarEvents: [
      {
        id: "2",
        title: "BTS World Tour 2025",
        imageUrl: "/placeholder.jpg",
        date: "August 15",
      },
      {
        id: "3",
        title: "BLACKPINK in Bangkok",
        imageUrl: "/placeholder.jpg",
        date: "September 20",
      },
      {
        id: "4",
        title: "TWICE 2025 World Tour",
        imageUrl: "/placeholder.jpg",
        date: "October 5",
      },
      {
        id: "5",
        title: "Red Velvet in Bangkok",
        imageUrl: "/placeholder.jpg",
        date: "November 12",
      },
      {
        id: "6",
        title: "NCT 127 Neo City Tour",
        imageUrl: "/placeholder.jpg",
        date: "December 3",
      },
      {
        id: "7",
        title: "ENHYPEN World Tour",
        imageUrl: "/placeholder.jpg",
        date: "January 15",
      },
      {
        id: "8",
        title: "IVE The First World Tour",
        imageUrl: "/placeholder.jpg",
        date: "February 8",
      },
      {
        id: "9",
        title: "NewJeans First Fan Meeting",
        imageUrl: "/placeholder.jpg",
        date: "March 20",
      },
    ],
  }

  return (
    <div>
      <div className="container pb-10">
        {/* Hero Image */}
        <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted sm:h-[400px] lg:h-[500px]">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPinIcon className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">{event.location.venue}</p>
                      <p className="text-sm">{event.location.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <ShareIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Event Description */}
            <div>
              <h2 className="text-lg font-semibold mb-2">About this Event</h2>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Organizer */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Organizer</h2>
              <Link href={`/organizer/${event.organizer.name}`} className="group">
                <Card className="p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <Image
                        src={event.organizer.image}
                        alt={event.organizer.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold truncate group-hover:text-primary">
                          {event.organizer.name}
                        </h3>
                        {event.organizer.verified && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <UserIcon className="inline-block h-3 w-3 mr-1" />
                        {event.organizer.eventsCount} events organized
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="lg:sticky lg:top-8">
            <TicketSelection
              eventId={event.id}
              ticketTypes={event.ticketTypes}
            />
          </div>
        </div>
      </div>

      {/* Similar Events Slider - Full Width */}
      <section className="bg-muted/50 py-12 mt-16">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-8">More Events Like This</h2>
        </div>
        <EventSlider events={event.similarEvents} />
      </section>
    </div>
  )
}

