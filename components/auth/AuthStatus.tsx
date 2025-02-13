"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function AuthStatus() {
  const router = useRouter()
  const { user, loading, error, logout } = useAuth()

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full">
        <span className="sr-only">Loading</span>
      </Button>
    )
  }

  if (!user || error) {
    return (
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    )
  }

  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return { href: "/admin/dashboard", label: "Admin Dashboard" }
      case "organizer":
        return { href: "/organizer/dashboard", label: "Organizer Dashboard" }
      default:
        return { href: "/dashboard", label: "Dashboard" }
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    router.refresh() // Force a refresh of the page data
  }

  const dashboardLink = getDashboardLink()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardLink.href}>{dashboardLink.label}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/events">My Events</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950"
          onClick={handleLogout}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

