"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { getCategoryIcon } from "@/lib/category-icons"

interface Category {
  id: string
  name: string
  icon: string
}

// Default categories in case API fails
const DEFAULT_CATEGORIES: Array<Omit<Category, 'id'> & { id?: string; href: string }> = [
  { name: "Conference", icon: "Video", href: "/events?category=Conference" },
  { name: "Workshop", icon: "Presentation", href: "/events?category=Workshop" },
  { name: "Concert", icon: "Music2", href: "/events?category=Concert" },
  { name: "Exhibition", icon: "Palette", href: "/events?category=Exhibition" },
  { name: "Sports", icon: "Trophy", href: "/events?category=Sports" },
  { name: "Networking", icon: "Users", href: "/events?category=Networking" },
  { name: "Festival", icon: "PartyPopper", href: "/events?category=Festival" },
  { name: "Other", icon: "Globe", href: "/events?category=Other" },
]

export function CategoryExplorer() {
  const [categories, setCategories] = useState<Array<Omit<Category, 'id'> & { id?: string; href: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.categories.getAll()

        // Map API categories to include href
        const mappedCategories = data.map(category => ({
          ...category,
          href: `/events?category=${encodeURIComponent(category.name)}`
        }))

        setCategories(mappedCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Fallback to default categories
        setCategories(DEFAULT_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon)
        return (
          <Link
            key={category.id || category.name}
            href={category.href}
            className="group flex flex-col items-center gap-3"
          >
            <div className="rounded-full bg-secondary p-6 shadow-sm transition-all group-hover:bg-primary/10 group-hover:shadow-md">
              <Icon className="h-7 w-7 text-primary transition-colors group-hover:text-primary/80" />
            </div>
            <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
              {category.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}