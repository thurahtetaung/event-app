"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart } from "@/components/organizer/RevenueChart"
import { TicketSalesChart } from "@/components/organizer/TicketSalesChart"
import { AttendeeChart } from "@/components/organizer/AttendeeChart"
import { EventCategoriesChart } from "@/components/organizer/EventCategoriesChart"
import { apiClient, OrganizationAnalytics } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("sales")

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
          toast.error("Failed to load analytics data")
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
      <div className="p-8 space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            There was an error loading your analytics data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed analysis of your events performance and ticket sales
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={analytics.revenueByMonth || []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketSalesChart data={analytics.ticketSalesByMonth || []} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${analytics.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className={`text-xs ${analytics.periodChanges.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analytics.periodChanges.revenueChange >= 0 ? '+' : ''}{analytics.periodChanges.revenueChange.toFixed(1)}% from last month
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tickets Sold</p>
                  <p className="text-2xl font-bold">{analytics.ticketsSold.toLocaleString()}</p>
                  <p className={`text-xs ${analytics.periodChanges.ticketsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analytics.periodChanges.ticketsChange >= 0 ? '+' : ''}{analytics.periodChanges.ticketsChange.toFixed(1)}% from last month
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Average Revenue per Ticket</p>
                  <p className="text-2xl font-bold">
                    ${analytics.ticketsSold > 0
                      ? (analytics.totalRevenue / analytics.ticketsSold).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendee Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendeeChart data={analytics.ticketSalesByMonth || []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Attendee Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                    <p className="text-2xl font-bold">{analytics.totalAttendees.toLocaleString()}</p>
                    <p className={`text-xs ${analytics.periodChanges.attendeesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {analytics.periodChanges.attendeesChange >= 0 ? '+' : ''}{analytics.periodChanges.attendeesChange.toFixed(1)}% from last month
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Average Attendees per Event</p>
                    <p className="text-2xl font-bold">
                      {analytics.totalEvents > 0
                        ? Math.round(analytics.totalAttendees / analytics.totalEvents).toLocaleString()
                        : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Event Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <EventCategoriesChart data={analytics.eventsByCategory || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</p>
                  <p className={`text-xs ${analytics.periodChanges.eventsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analytics.periodChanges.eventsChange >= 0 ? '+' : ''}{analytics.periodChanges.eventsChange.toFixed(1)}% from last month
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Event Categories</p>
                  <p className="text-2xl font-bold">
                    {(analytics.eventsByCategory || []).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

