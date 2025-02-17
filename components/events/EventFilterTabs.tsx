"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { addDays, format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns"

const filters = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "Free", value: "free" },
] as const

type FilterValue = typeof filters[number]["value"]

export function EventFilterTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = (searchParams.get("filter") || "all") as FilterValue

  const handleFilterChange = (value: FilterValue) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset existing date and price filters
    params.delete("date")
    params.delete("priceRange")

    if (value === "all") {
      params.delete("filter")
    } else if (value === "today") {
      params.set("date", format(new Date(), "yyyy-MM-dd"))
    } else if (value === "tomorrow") {
      params.set("date", format(addDays(new Date(), 1), "yyyy-MM-dd"))
    } else if (value === "weekend") {
      const today = new Date()
      const saturday = startOfDay(endOfWeek(today, { weekStartsOn: 6 }))
      const sunday = endOfDay(endOfWeek(today, { weekStartsOn: 0 }))
      params.set("date", format(saturday, "yyyy-MM-dd"))
    } else if (value === "free") {
      params.set("priceRange", "free")
    }

    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="flex gap-1.5">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="ghost"
          onClick={() => handleFilterChange(filter.value)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            currentFilter === filter.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}