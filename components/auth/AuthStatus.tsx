"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ApplicationStatus {
  id: string
  status: "pending" | "approved" | "rejected"
  organizationName: string
  rejectionReason?: string
  createdAt: string
}

export function AuthStatus() {
  const router = useRouter()
  const { user, loading, error, logout } = useAuth()
  const [applications, setApplications] = useState<ApplicationStatus[]>([])
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    async function checkApplicationStatus() {
      if (user?.role === "user") {
        try {
          setIsCheckingStatus(true)
          const data = await apiClient.organizerApplications.getByUserId()
          setApplications(data as ApplicationStatus[])
        } catch (error) {
          // If no application found, we don't need to handle the error
          if (!(error instanceof Error && error.message.includes("No organizer application found"))) {
            console.error("Error fetching application status:", error)
          }
          setApplications([])
        } finally {
          setIsCheckingStatus(false)
        }
      } else {
        setIsCheckingStatus(false)
      }
    }

    checkApplicationStatus()
  }, [user])

  if (loading || isCheckingStatus) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (!user || error) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    )
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return { href: "/admin/dashboard", label: "Admin Dashboard" }
      case "organizer":
        return { href: "/organizer/dashboard", label: "Organizer Dashboard" }
      default:
        return { href: "/my-events", label: "My Events" }
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const dashboardLink = getDashboardLink()
  const latestApplication = applications[0]
  const hasPendingApplication = applications.some(app => app.status === "pending")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardLink.href}>{dashboardLink.label}</Link>
        </DropdownMenuItem>
        {user.role === "user" && (
          <>
            {!hasPendingApplication && (
              <DropdownMenuItem asChild>
                <Link href="/become-organizer">Become an Organizer</Link>
              </DropdownMenuItem>
            )}
            {latestApplication && (
              <DropdownMenuItem asChild>
                <Link href="/application-status">Organizer Application Status</Link>
              </DropdownMenuItem>
            )}
          </>
        )}
        {user.role === "organizer" && (
          <DropdownMenuItem asChild>
            <Link href="/organizer/events/create">Create Event</Link>
          </DropdownMenuItem>
        )}
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

