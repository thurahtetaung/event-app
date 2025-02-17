"use client"

import { useAuth } from "@/contexts/AuthContext"
import { SearchBar } from "@/components/events/SearchBar"
import { CategoryExplorer } from "@/components/events/CategoryExplorer"
import { EventCard } from "@/components/events/EventCard"
import { EventFilterTabs } from "@/components/events/EventFilterTabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient, type Event } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [popularEvents, setPopularEvents] = useState<Event[]>([])
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/landing")
    }
  }, [user, router])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        // Fetch popular events (sorted by date)
        const popular = await apiClient.events.getPublicEvents({
          sort: "date",
        })
        setPopularEvents(popular)

        // Fetch trending events (sorted by price high to low)
        const trending = await apiClient.events.getPublicEvents({
          sort: "price-high",
        })
        setTrendingEvents(trending)
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchEvents()
    }
  }, [user])

  if (!user) {
    return null // Return null to prevent flash of content during redirect
  }

  return (
    <main className="min-h-screen bg-muted/50">
      <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-center py-6">
          <SearchBar />
        </div>
      </div>

      <div className="container space-y-10 py-8">
        <section className="rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-card-foreground">
            Explore Categories
          </h2>
          <CategoryExplorer />
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">
              Popular Events
            </h2>
            <EventFilterTabs />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))
            ) : popularEvents.length > 0 ? (
              popularEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No events found
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-card-foreground">
            Trending Events Around the World
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))
            ) : trendingEvents.length > 0 ? (
              trendingEvents.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No events found
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

