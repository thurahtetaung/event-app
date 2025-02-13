"use client"

import { useState } from "react"
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
} from "lucide-react"
import { EventRevenueChart } from "@/components/organizer/EventRevenueChart"
import { EventTicketSalesChart } from "@/components/organizer/EventTicketSalesChart"
import { EventAttendeeChart } from "@/components/organizer/EventAttendeeChart"
import { AttendeeLocationChart } from "@/components/organizer/AttendeeLocationChart"
import { TicketTypeDistributionChart } from "@/components/organizer/TicketTypeDistributionChart"
import { TicketTimelineChart } from "@/components/organizer/TicketTimelineChart"
import { DailySalesChart } from "@/components/organizer/DailySalesChart"

// Mock data - replace with API call in production
const eventStats = {
  totalAttendees: "842",
  totalRevenue: "$12,458.89",
  ticketsSold: "923",
  averageTicketPrice: "$89.99",
}

interface EventAnalyticsPageProps {
  params: {
    id: string
  }
}

export default function EventAnalyticsPage({ params }: EventAnalyticsPageProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      name: "Total Attendees",
      value: eventStats.totalAttendees,
      description: "+20% from last week",
      icon: Users,
    },
    {
      name: "Total Revenue",
      value: eventStats.totalRevenue,
      description: "+15% from last week",
      icon: BadgeDollarSign,
    },
    {
      name: "Tickets Sold",
      value: eventStats.ticketsSold,
      description: "+12% from last week",
      icon: Ticket,
    },
    {
      name: "Average Ticket Price",
      value: eventStats.averageTicketPrice,
      description: "Per ticket",
      icon: BadgeDollarSign,
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
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <EventRevenueChart eventId={params.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <EventTicketSalesChart eventId={params.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketTimelineChart eventId={params.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketTypeDistributionChart eventId={params.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendee Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <EventAttendeeChart eventId={params.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendeeLocationChart eventId={params.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}