import { Music2, Presentation, PartyPopper, Video, Globe } from "lucide-react"
import Link from "next/link"

const categories = [
  { icon: Music2, label: "Concerts", href: "/events?category=concerts" },
  { icon: Presentation, label: "Classes & Workshops", href: "/events?category=classes" },
  { icon: PartyPopper, label: "Festival and Fairs", href: "/events?category=festivals" },
  { icon: Video, label: "Conferences", href: "/events?category=conferences" },
  { icon: Globe, label: "Online Events", href: "/events?category=online" },
]

export function CategoryExplorer() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => (
        <Link
          key={category.label}
          href={category.href}
          className="group flex flex-col items-center gap-3"
        >
          <div className="rounded-full bg-secondary p-6 shadow-sm transition-all group-hover:bg-primary/10 group-hover:shadow-md">
            <category.icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary/80" />
          </div>
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  )
}