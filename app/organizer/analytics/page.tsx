import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevenueChart } from "@/components/organizer/RevenueChart"
import { TicketSalesChart } from "@/components/organizer/TicketSalesChart"
import { AttendeeChart } from "@/components/organizer/AttendeeChart"
import { EventCategoriesChart } from "@/components/organizer/EventCategoriesChart"
import { Overview } from "@/components/organizer/Overview"

export const metadata: Metadata = {
  title: "Analytics | Event Platform",
  description: "Advanced analytics and insights for your events",
}

export default function AnalyticsPage() {
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

      <Tabs defaultValue="sales" className="space-y-4">
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
                <RevenueChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketSalesChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendeeChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Types</CardTitle>
              </CardHeader>
              <CardContent>
                <Overview />
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
              <EventCategoriesChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

