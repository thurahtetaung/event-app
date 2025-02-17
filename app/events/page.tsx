"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { EventCard } from "@/components/events/EventCard"
import { EventFilters } from "@/components/events/EventFilters"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallback, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { Event } from "@/lib/api-client"

export default function EventsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Create URLSearchParams object for manipulation
  const createQueryString = useCallback(
    (params: Record<string, string | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      // Update search params
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })

      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Get current filter values
  const category = searchParams.get("category") || undefined
  const query = searchParams.get("query") || undefined
  const sort = (searchParams.get("sort") || "date") as 'date' | 'price-low' | 'price-high'
  const date = searchParams.get("date") || undefined
  const priceRange = (searchParams.get("priceRange") || undefined) as 'all' | 'free' | 'paid' | undefined
  const minPrice = searchParams.get("minPrice") || undefined
  const maxPrice = searchParams.get("maxPrice") || undefined
  const isOnline = searchParams.get("isOnline") === "true"
  const isInPerson = searchParams.get("isInPerson") === "true"

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const params = {
          category: category !== "All Categories" ? category : undefined,
          query,
          sort,
          date,
          priceRange: priceRange !== "all" ? priceRange : undefined,
          minPrice,
          maxPrice,
          isOnline: isOnline ? true : undefined,
          isInPerson: isInPerson ? true : undefined,
        };

        // Remove undefined and empty string values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) =>
            value !== undefined && value !== ''
          )
        );

        console.log('Fetching events with params:', cleanParams); // Debug log
        const data = await apiClient.events.getPublicEvents(cleanParams)
        setEvents(data)
      } catch (error) {
        console.error("Failed to fetch events:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [category, query, sort, date, priceRange, minPrice, maxPrice, isOnline, isInPerson])

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
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  No events found
                  {category ? ` in ${category}` : ""}
                  {query ? ` matching "${query}"` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}