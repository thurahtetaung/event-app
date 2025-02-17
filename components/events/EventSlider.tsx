"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Event } from "@/lib/api-client"

interface EventSliderProps {
  events: Event[]
  currentEventId?: string
}

export function EventSlider({ events, currentEventId }: EventSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Filter out current event if it exists
  const filteredEvents = events.filter(event => event.id !== currentEventId)

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return

    const container = containerRef.current
    const cardWidth = container.querySelector('[data-card]')?.clientWidth ?? 300
    const gap = 24 // matches the gap-6 class (6 * 4px)
    const scrollAmount = cardWidth + gap

    const maxScroll = container.scrollWidth - container.clientWidth
    const targetScroll = direction === "left"
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    // Update current index
    const newIndex = direction === "left"
      ? Math.max(0, currentIndex - 1)
      : Math.min(filteredEvents.length - 1, currentIndex + 1)

    setCurrentIndex(newIndex)

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })
  }

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused || filteredEvents.length <= 1) return

    const interval = setInterval(() => {
      if (currentIndex >= filteredEvents.length - 1) {
        // Reset to start when reaching the end
        setCurrentIndex(0)
        if (containerRef.current) {
          containerRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          })
        }
      } else {
        scroll("right")
      }
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [currentIndex, filteredEvents.length, isPaused])

  if (filteredEvents.length === 0) {
    return null
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Buttons */}
      <div className="container absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full opacity-70 hover:opacity-100 pointer-events-auto shadow-lg"
          onClick={() => scroll("left")}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full opacity-70 hover:opacity-100 pointer-events-auto shadow-lg"
          onClick={() => scroll("right")}
          disabled={currentIndex === filteredEvents.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Events Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-hidden px-8 pb-4 snap-x snap-mandatory"
      >
        {filteredEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className={cn(
              "flex-none w-[300px] snap-start",
              "transition-transform hover:scale-[1.02] active:scale-[0.98]"
            )}
            data-card
          >
            <Card className="overflow-hidden h-full">
              <div className="relative h-48 w-full">
                <Image
                  src={event.coverImage || "/placeholder.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(event.startTimestamp), "MMMM d, yyyy")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Slide Indicators */}
      {filteredEvents.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {filteredEvents.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentIndex === index
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => {
                setCurrentIndex(index)
                if (containerRef.current) {
                  const cardWidth = containerRef.current.querySelector('[data-card]')?.clientWidth ?? 300
                  const gap = 24
                  containerRef.current.scrollTo({
                    left: index * (cardWidth + gap),
                    behavior: "smooth",
                  })
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}