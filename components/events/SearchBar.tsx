import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-border/40 bg-card px-4 py-2.5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
      {/* <Search className="h-5 w-5 text-muted-foreground" /> */}
      <Input
        type="text"
        placeholder="Search Events, Categories, Locations..."
        className="border-0 bg-transparent p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
      />
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  )
}