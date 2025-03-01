"use client"

import { Suspense, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Users,
  BadgeDollarSign,
  Ticket,
  TrendingUp,
  Loader2,
  TrendingDown,
} from "lucide-react"
import { RevenueChart } from "@/components/organizer/RevenueChart"
import { TicketSalesChart } from "@/components/organizer/TicketSalesChart"
import { UpcomingEvents } from "@/components/organizer/UpcomingEvents"
import { ChartSkeleton } from "@/components/organizer/ChartSkeleton"
import { apiClient, OrganizationAnalytics } from "@/lib/api-client"
import { toast } from "sonner"

export default function OrganizerDashboard() {
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchAnalytics() {
      try {
        const data = await apiClient.organizations.getAnalytics()
        if (isMounted) {
          setAnalytics(data)
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch organization analytics:", error)
          toast.error("Failed to load organization analytics")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Fallback if analytics loading failed
  if (!analytics) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! There was an error loading your analytics data.
          </p>
        </div>
      </div>
    )
  }

  // Format percentage change for display
  const formatPercentageChange = (change: number): { text: string, isPositive: boolean } => {
    const isPositive = change >= 0;
    return {
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      isPositive
    };
  };

  const stats = [
    {
      name: "Total Events",
      value: analytics.totalEvents.toString(),
      change: formatPercentageChange(analytics.periodChanges.eventsChange),
      description: "from last month",
      icon: CalendarDays,
    },
    {
      name: "Total Attendees",
      value: analytics.totalAttendees.toLocaleString(),
      change: formatPercentageChange(analytics.periodChanges.attendeesChange),
      description: "from last month",
      icon: Users,
    },
    {
      name: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: formatPercentageChange(analytics.periodChanges.revenueChange),
      description: "from last month",
      icon: BadgeDollarSign,
    },
    {
      name: "Tickets Sold",
      value: analytics.ticketsSold.toLocaleString(),
      change: formatPercentageChange(analytics.periodChanges.ticketsChange),
      description: "from last month",
      icon: Ticket,
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your events and sales.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.change.isPositive ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.change.isPositive ? "text-green-500" : "text-red-500"}>
                    {stat.change.text}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart data={analytics.revenueByMonth || []} />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ticket Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <TicketSalesChart data={analytics.ticketSalesByMonth || []} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <UpcomingEvents events={analytics.recentEvents || []} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}