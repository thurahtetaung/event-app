"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BadgeDollarSign,
  Ticket,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventRevenueChart } from "@/components/organizer/EventRevenueChart"
import { EventTicketSalesChart } from "@/components/organizer/EventTicketSalesChart"
import { EventAttendeeChart } from "@/components/organizer/EventAttendeeChart"
import { AttendeeLocationChart } from "@/components/organizer/AttendeeLocationChart"
import { TicketTypeDistributionChart } from "@/components/organizer/TicketTypeDistributionChart"
import { TicketInventoryChart } from "@/components/organizer/TicketInventoryChart"
import { DailySalesChart } from "@/components/organizer/DailySalesChart"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface EventAnalytics {
  totalTicketsSold: number
  totalRevenue: number
  ticketTypeStats: Array<{
    id: string
    name: string
    type: "paid" | "free"
    totalSold: number
    totalRevenue: number
    status: "on-sale" | "paused" | "sold-out" | "scheduled"
    quantity: number
  }>
  salesByDay: Array<{
    date: string
    count: number
    revenue: number
  }>
}

interface EventAnalyticsPageProps {
  params: {
    id: string
  }
}

export default function EventAnalyticsPage({ params }: EventAnalyticsPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalytics() {
      try {
        const data = await apiClient.events.getAnalytics(params.id)
        if (isMounted) {
          setAnalytics(data as EventAnalytics)
        }
      } catch (error: any) {
        if (!isMounted) return;

        console.error("Error fetching analytics:", error);

        // Check for 404 not found errors
        if (error?.status === 404 || error?.error?.message?.includes('not found')) {
          toast.error("Event not found or analytics not available");
          // Delay navigation slightly so the user can see the toast
          setTimeout(() => router.push("/organizer/events"), 1500);
        } else if (error instanceof Error && !error.message.includes('Request was cancelled')) {
          toast.error("Failed to load analytics data");
          router.push(`/organizer/events/${params.id}`);
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
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  console.log(analytics)
  if (!analytics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <div className="flex flex-col items-center text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold">Analytics Not Available</h2>
          <p className="text-muted-foreground mb-6">
            The analytics for this event could not be loaded. The event may have been deleted or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/organizer/events")}>
            Go Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: "Total Tickets Sold",
      value: analytics.totalTicketsSold.toString(),
      description: "Total tickets sold",
      icon: Ticket,
    },
    {
      name: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      description: "Total revenue generated",
      icon: BadgeDollarSign,
    },
    {
      name: "Average Price",
      value: analytics.totalTicketsSold > 0
        ? `$${(analytics.totalRevenue / analytics.totalTicketsSold).toFixed(2)}`
        : "$0.00",
      description: "Per ticket",
      icon: DollarSign,
    },
    {
      name: "Ticket Types",
      value: analytics.ticketTypeStats.length.toString(),
      description: "Different ticket types",
      icon: Ticket,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Event Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights and performance metrics for your event
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <CalendarDays className="mr-2 h-4 w-4" />
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
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
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <EventRevenueChart data={analytics.salesByDay} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketTypeDistributionChart data={analytics.ticketTypeStats} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Types Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.ticketTypeStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No ticket types available yet</p>
                    <p className="text-xs">Create ticket types to see their performance</p>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium">
                      <div>Name</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Sold</div>
                      <div>Revenue</div>
                    </div>
                    <div className="divide-y">
                      {analytics.ticketTypeStats.map((ticket) => (
                        <div key={ticket.id} className="grid grid-cols-5 gap-4 p-4 text-sm">
                          <div>{ticket.name}</div>
                          <div className="capitalize">{ticket.type}</div>
                          <div>
                            <Badge
                              variant={
                                ticket.status === "on-sale"
                                  ? "success"
                                  : ticket.status === "sold-out"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {ticket.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div>{ticket.totalSold}</div>
                          <div>${ticket.totalRevenue.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketInventoryChart data={analytics.ticketTypeStats} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.salesByDay.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <p className="text-sm">No sales data available yet</p>
                    <p className="text-xs">Sales data will appear here once tickets are sold</p>
                  </div>
                ) : (
                  <DailySalesChart data={analytics.salesByDay} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}