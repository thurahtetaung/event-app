"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { themeConfig } from "@/lib/theme"
import { cn } from "@/lib/utils"
import AuthStatus from "@/components/auth/AuthStatus"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="text-lg font-semibold">{themeConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-6">
          {themeConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
          <AuthStatus />
        </nav>
      </div>
    </header>
  )
}