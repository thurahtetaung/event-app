import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <Input
        type="text"
        placeholder="Search Events, Categories, Locations..."
        className="w-full min-h-[3.5rem] rounded-full border-border/40 bg-card px-6 py-4 pr-12 text-base shadow-sm transition-all hover:border-primary/20 hover:shadow-md focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 transform"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  )
}