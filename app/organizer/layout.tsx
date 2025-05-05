"use client"

import { useState, useEffect, useRef } from "react" // Import useRef
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" // Import useRouter
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2, // Import Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
// Revert import to use the local UI component for all tooltip parts
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner" // Import toast

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/organizer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Events",
    href: "/organizer/events",
    icon: CalendarDays,
    description: "Manage your events and tickets",
  },
  {
    title: "Analytics",
    href: "/organizer/analytics",
    icon: BarChart3,
    description: "Track performance and insights",
  },
  {
    title: "Settings",
    href: "/organizer/settings",
    icon: Settings,
    description: "Manage organization details",
  },
]

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const redirectInitiatedRef = useRef(false); // Add ref to track redirection

  // Role checking and redirection
  useEffect(() => {
    console.log(`[OrganizerLayout] useEffect triggered - Loading: ${loading}, User:`, user);

    // Check if redirect has already been initiated
    if (redirectInitiatedRef.current) {
      console.log("[OrganizerLayout] Redirect already initiated, skipping.");
      return;
    }

    if (loading) {
      console.log("[OrganizerLayout] Still loading...");
      return;
    }

    if (!user) {
      console.log("[OrganizerLayout] No user found after loading. Redirecting to login.");
      if (!redirectInitiatedRef.current) { // Check ref before redirecting
        redirectInitiatedRef.current = true; // Set flag before redirect
        // toast.error("Authentication required. Redirecting to login."); // REMOVED TOAST
        router.replace('/login?from=' + pathname);
      }
      return;
    }

    console.log(`[OrganizerLayout] User loaded. Role: ${user.role}`);
    // If user exists but is NOT strictly 'organizer', show toast and redirect
    if (user.role !== 'organizer') {
      console.log(`[OrganizerLayout] Access Denied - Role: ${user.role}. Redirecting.`);
      redirectInitiatedRef.current = true; // Set flag before redirect
      toast.error("Access Denied: You do not have permission to view this page.")
      // Redirect admins to admin dashboard, others to home
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/';
      console.log(`[OrganizerLayout] Redirecting to: ${redirectPath}`);
      router.replace(redirectPath);
      return;
    }

    console.log("[OrganizerLayout] User is organizer. Allowing access.");
    // If user is organizer, do nothing (allow rendering)

  }, [user, loading, router, pathname])

  // Show loading state while auth check is in progress or if user is not organizer
  if (loading || !user || user.role !== 'organizer') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Define handleLogout before the return statement
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from useAuth context
      // Redirect is handled within the logout function in AuthContext
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Render the actual layout if loading is done and user is organizer
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={cn(
          "sticky top-0 h-screen bg-muted/50 border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-1 p-4">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          isCollapsed && "justify-center"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            {item.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </div>
            <div className="p-4 border-t">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center"
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && "Logout"}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-4 h-8 w-8 rounded-full border bg-background"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}
