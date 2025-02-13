"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Users,
  BadgeDollarSign,
  Ticket,
  TrendingUp,
} from "lucide-react"
import { RevenueChart } from "@/components/organizer/RevenueChart"
import { TicketSalesChart } from "@/components/organizer/TicketSalesChart"
import { UpcomingEvents } from "@/components/organizer/UpcomingEvents"
import { ChartSkeleton } from "@/components/organizer/ChartSkeleton"

const stats = [
  {
    name: "Total Events",
    value: "12",
    description: "2 new this month",
    icon: CalendarDays,
  },
  {
    name: "Total Attendees",
    value: "1,482",
    description: "+20% from last month",
    icon: Users,
  },
  {
    name: "Total Revenue",
    value: "$24,231.89",
    description: "+15% from last month",
    icon: BadgeDollarSign,
  },
  {
    name: "Tickets Sold",
    value: "1,893",
    description: "+12% from last month",
    icon: Ticket,
  },
]

export default function OrganizerDashboard() {
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
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>{stat.description}</span>
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
              <RevenueChart />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ticket Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <TicketSalesChart />
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
            <UpcomingEvents />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}