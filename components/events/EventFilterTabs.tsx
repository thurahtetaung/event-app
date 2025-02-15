import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const filters = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Weekend", value: "weekend" },
  { label: "Free", value: "free" },
]

export function EventFilterTabs() {
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get("filter") || "all"

  return (
    <div className="flex gap-1.5">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={`?filter=${filter.value}`}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-all",
            currentFilter === filter.value
              ? "badge-primary shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  )
}