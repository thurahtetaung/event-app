"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
  Loader2, // Import Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Applications",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const redirectInitiatedRef = useRef(false);

  // Role checking and redirection
  useEffect(() => {
    // Log entry point with current state
    console.log(`[AdminLayout] useEffect triggered. Path: ${pathname}, Loading: ${loading}, User:`, user, `Redirect Ref: ${redirectInitiatedRef.current}`);

    // Check if redirect has already been initiated
    if (redirectInitiatedRef.current) {
      console.log("[AdminLayout] Redirect already initiated, skipping.");
      return;
    }

    // Wait until loading is complete
    if (loading) {
      console.log("[AdminLayout] Still loading auth state...");
      return; // Do nothing while loading
    }

    console.log("[AdminLayout] Auth loading complete.");

    // If loading is done and there's no user, redirect to login
    if (!user) {
      console.log("[AdminLayout] No user found after loading. Setting redirect flag and redirecting to login.");
      if (!redirectInitiatedRef.current) {
        redirectInitiatedRef.current = true; // Set flag
        // toast.error("Authentication required. Redirecting to login."); // REMOVED TOAST
        router.replace('/login?from=' + pathname); // Use replace to avoid history entry
      }
      return;
    }

    // If user exists but is not an admin, show toast and redirect
    console.log(`[AdminLayout] User found. Role: ${user.role}`);
    if (user.role !== 'admin') {
      console.log(`[AdminLayout] Access Denied - Role: ${user.role}. Setting redirect flag and redirecting.`);
      redirectInitiatedRef.current = true; // Set flag
      toast.error("Access Denied: You do not have permission to view this page.")
      let redirectPath = "/";
      if (user.role === 'organizer') {
        redirectPath = '/organizer/dashboard';
      }
      console.log(`[AdminLayout] Redirecting non-admin to: ${redirectPath}`);
      router.replace(redirectPath); // Use replace
      return;
    }

    // If user is admin, allow rendering
    console.log("[AdminLayout] User is admin. Allowing access.");

  }, [user, loading, router, pathname])

  // Show loading state while auth check is in progress
  console.log(`[AdminLayout] Rendering check. Loading: ${loading}, User:`, user);
  if (loading || !user || user.role !== 'admin') {
    console.log("[AdminLayout] Rendering loading/permission check screen.");
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render the actual layout if loading is done and user is admin
  console.log("[AdminLayout] Rendering main layout.");
  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={cn(
          "relative bg-muted/50 border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-1 p-4">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
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
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {item.title}
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
                    onClick={logout}
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}