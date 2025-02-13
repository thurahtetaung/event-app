import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/admin/RevenueChart"
import { UserGrowthChart } from "@/components/admin/UserGrowthChart"
import { EventsChart } from "@/components/admin/EventsChart"

export const metadata: Metadata = {
  title: "Analytics & Reports",
  description: "View platform analytics and generate reports",
}

export default function ReportsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">Monitor platform performance and generate insights.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue breakdown for the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
            <CardDescription>Event creation and ticket sales trends</CardDescription>
          </CardHeader>
          <CardContent>
            <EventsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

