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
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 9 // Show 9 events per page (3x3 grid)

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

  // Calculate pagination values
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(events.length / eventsPerPage)

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        setCurrentPage(1) // Reset to first page when new data is loaded
      } catch (error) {
        console.error("Failed to fetch events:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [category, query, sort, date, priceRange, minPrice, maxPrice, isOnline, isInPerson])

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null

    // Logic to show limited page numbers with ellipsis
    const renderPageNumbers = () => {
      const pageNumbers = [];
      const maxVisiblePages = 5; // Maximum number of page buttons to show

      // Always show first page
      pageNumbers.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
          className="w-9 h-9 p-0"
        >
          1
        </Button>
      );

      // Calculate range of visible page numbers
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

      // Adjust if we're near the beginning
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis-start" className="px-2">...</span>);
      }

      // Add middle page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i)}
            className="w-9 h-9 p-0"
          >
            {i}
          </Button>
        );
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis-end" className="px-2">...</span>);
      }

      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pageNumbers.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            className="w-9 h-9 p-0"
          >
            {totalPages}
          </Button>
        );
      }

      return pageNumbers;
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {renderPageNumbers()}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    )
  }

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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-[380px] rounded-lg border border-border/40 bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {currentEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <Pagination />
              </>
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