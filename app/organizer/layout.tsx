"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

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
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "relative bg-muted/50 border-r transition-all duration-300",
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
        <div className="flex-1">
          {children}
        </div>
      </div>
    </TooltipProvider>
  )
}
