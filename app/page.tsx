"use client"

import { useAuth } from "@/contexts/AuthContext"
import { SearchBar } from "@/components/events/SearchBar"
import { CategoryExplorer } from "@/components/events/CategoryExplorer"
import { EventCard } from "@/components/events/EventCard"
import { EventFilterTabs } from "@/components/events/EventFilterTabs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

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
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/landing")
    }
  }, [user, router])

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
            {SAMPLE_EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-card-foreground">
            Trending Events Around the World
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

