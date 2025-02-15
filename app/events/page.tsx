"use client"

import { useSearchParams } from "next/navigation"
import { EventCard } from "@/components/events/EventCard"
import { EventFilters } from "@/components/events/EventFilters"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"

// This would come from your API in a real app
const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "TAEYAND 2025 TOUR - [THE LIGHT YEAR] - ENCORE",
    category: "K-Pop Live Concert",
    date: "20 April 2025",
    time: "6:00 PM - 9:00 PM",
    location: "125 Siam Avenue, Britton Rouge",
    price: 100,
    imageUrl: "/placeholder.jpg",
    organizer: "The World Organizer",
  },
  {
    id: "2",
    title: "Web3 Developer Conference 2025",
    category: "Technology",
    date: "25 April 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Bangkok Convention Center",
    price: 250,
    imageUrl: "/placeholder.jpg",
    organizer: "Tech Events Thailand",
  },
  {
    id: "3",
    title: "Thai Food Festival 2025",
    category: "Food & Drink",
    date: "27 April 2025",
    time: "11:00 AM - 10:00 PM",
    location: "Lumpini Park, Bangkok",
    price: 0,
    imageUrl: "/placeholder.jpg",
    organizer: "Bangkok Food Association",
  },
  {
    id: "4",
    title: "Startup Pitch Night",
    category: "Networking",
    date: "15 May 2025",
    time: "6:30 PM - 9:30 PM",
    location: "Innovation Hub, Bangkok",
    price: 50,
    imageUrl: "/placeholder.jpg",
    organizer: "Bangkok Startup Network",
  },
  {
    id: "5",
    title: "International Jazz Festival",
    category: "Concert",
    date: "22 May 2025",
    time: "4:00 PM - 11:00 PM",
    location: "Riverside Plaza, Bangkok",
    price: 150,
    imageUrl: "/placeholder.jpg",
    organizer: "Bangkok Music Society",
  },
  {
    id: "6",
    title: "Digital Art Exhibition",
    category: "Exhibition",
    date: "1 June 2025",
    time: "10:00 AM - 8:00 PM",
    location: "Modern Art Gallery, Bangkok",
    price: 75,
    imageUrl: "/placeholder.jpg",
    organizer: "Digital Artists Collective",
  },
  {
    id: "7",
    title: "Yoga and Wellness Workshop",
    category: "Workshop",
    date: "8 June 2025",
    time: "8:00 AM - 12:00 PM",
    location: "Wellness Center, Chiang Mai",
    price: 80,
    imageUrl: "/placeholder.jpg",
    organizer: "Mindful Living Thailand",
  },
  {
    id: "8",
    title: "Street Food Night Market",
    category: "Food & Drink",
    date: "15 June 2025",
    time: "5:00 PM - 11:00 PM",
    location: "Chinatown, Bangkok",
    price: 0,
    imageUrl: "/placeholder.jpg",
    organizer: "Street Food Association",
  },
  {
    id: "9",
    title: "Blockchain Development Workshop",
    category: "Technology",
    date: "20 June 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Tech Campus, Bangkok",
    price: 300,
    imageUrl: "/placeholder.jpg",
    organizer: "Blockchain Thailand",
  },
  {
    id: "10",
    title: "Summer Music Festival",
    category: "Concert",
    date: "29 June 2025",
    time: "2:00 PM - 11:00 PM",
    location: "Beach Resort, Phuket",
    price: 200,
    imageUrl: "/placeholder.jpg",
    organizer: "Festival Productions",
  },
  {
    id: "11",
    title: "Photography Workshop",
    category: "Workshop",
    date: "5 July 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Creative Space, Bangkok",
    price: 120,
    imageUrl: "/placeholder.jpg",
    organizer: "Photography Club",
  },
  {
    id: "12",
    title: "Sustainable Living Expo",
    category: "Exhibition",
    date: "12 July 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Green Convention Center, Bangkok",
    price: 25,
    imageUrl: "/placeholder.jpg",
    organizer: "Eco Thailand",
  }
]

export default function EventsPage() {
  const searchParams = useSearchParams()
  const [events, setEvents] = useState(SAMPLE_EVENTS)
  const [isLoading, setIsLoading] = useState(false)

  const category = searchParams.get("category")
  const query = searchParams.get("q")
  const sort = searchParams.get("sort") || "date"

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API here with the filters
        // const response = await fetch(`/api/events?category=${category}&q=${query}&sort=${sort}`)
        // const data = await response.json()
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Filter events based on category and search query
        let filteredEvents = [...SAMPLE_EVENTS]
        if (category) {
          filteredEvents = filteredEvents.filter(event =>
            event.category.toLowerCase() === category.toLowerCase()
          )
        }
        if (query) {
          filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            event.category.toLowerCase().includes(query.toLowerCase()) ||
            event.location.toLowerCase().includes(query.toLowerCase())
          )
        }

        // Sort events
        filteredEvents.sort((a, b) => {
          switch (sort) {
            case "price-low":
              return a.price - b.price
            case "price-high":
              return b.price - a.price
            case "date":
            default:
              return new Date(a.date).getTime() - new Date(b.date).getTime()
          }
        })

        setEvents(filteredEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [category, query, sort])

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              {category
                ? `Browsing ${category} events`
                : query
                ? `Search results for "${query}"`
                : "Browse all events"}
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <EventFilters />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="hidden md:block">
            <EventFilters />
          </div>
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-[400px] rounded-lg border border-border/40 bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}