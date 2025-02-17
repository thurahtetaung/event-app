"use client"

import {
  Music2,
  Presentation,
  PartyPopper,
  Video,
  Globe,
  Users,
  Trophy,
  Palette
} from "lucide-react"
import Link from "next/link"

const categoryIcons = {
  'Conference': Video,
  'Workshop': Presentation,
  'Concert': Music2,
  'Exhibition': Palette,
  'Sports': Trophy,
  'Networking': Users,
  'Festival': PartyPopper,
  'Other': Globe,
} as const

type CategoryType = keyof typeof categoryIcons

const categories: Array<{ label: CategoryType; href: string }> = [
  { label: "Conference", href: "/events?category=Conference" },
  { label: "Workshop", href: "/events?category=Workshop" },
  { label: "Concert", href: "/events?category=Concert" },
  { label: "Exhibition", href: "/events?category=Exhibition" },
  { label: "Sports", href: "/events?category=Sports" },
  { label: "Networking", href: "/events?category=Networking" },
  { label: "Festival", href: "/events?category=Festival" },
  { label: "Other", href: "/events?category=Other" },
]

export function CategoryExplorer() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = categoryIcons[category.label]
        return (
        <Link
          key={category.label}
          href={category.href}
          className="group flex flex-col items-center gap-3"
        >
          <div className="rounded-full bg-secondary p-6 shadow-sm transition-all group-hover:bg-primary/10 group-hover:shadow-md">
              <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary/80" />
          </div>
          <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
            {category.label}
          </span>
        </Link>
        )
      })}
    </div>
  )
}