import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MapPin, Phone, Calendar, User2, CreditCard, Clock } from "lucide-react"
import { UserActions } from "@/components/admin/UserActions"

export const metadata: Metadata = {
  title: "User Details",
  description: "View and manage user details",
}

// In a real app, fetch this data from your API
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  status: "active",
  avatar: "/placeholder.jpg",
  phone: "+1 (555) 123-4567",
  location: "New York, USA",
  joinDate: "January 15, 2024",
  lastActive: "2 hours ago",
  events: [
    { id: "1", name: "Tech Conference 2024", date: "2024-03-15", status: "upcoming", price: 199.99 },
    { id: "2", name: "Music Festival", date: "2024-02-01", status: "attended", price: 89.99 },
    { id: "3", name: "Art Exhibition", date: "2024-01-20", status: "cancelled", price: 49.99 },
  ],
  transactions: [
    { id: "1", event: "Tech Conference 2024", amount: 199.99, date: "2024-02-15", status: "completed" },
    { id: "2", event: "Music Festival", amount: 89.99, date: "2024-01-01", status: "refunded" },
    { id: "3", event: "Art Exhibition", amount: 49.99, date: "2024-01-20", status: "cancelled" },
  ],
  stats: {
    totalSpent: 339.97,
    eventsAttended: 5,
    eventsUpcoming: 2,
    eventsCancelled: 1,
  },
}

interface UserDetailsPageProps {
  params: {
    id: string
  }
}

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  // In a real app, fetch user data here
  const user = mockUser
  if (!user) notFound()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">View and manage user information</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold truncate">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <UserActions userId={user.id} userStatus={user.status} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User2 className="h-4 w-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${user.stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.eventsAttended}</div>
            <p className="text-xs text-muted-foreground">Total events attended</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.eventsUpcoming}</div>
            <p className="text-xs text-muted-foreground">Events booked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.lastActive}</div>
            <p className="text-xs text-muted-foreground">Time since last activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>Events the user has registered for or attended</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${event.price.toFixed(2)}</p>
                      <Badge
                        variant={
                          event.status === "upcoming"
                            ? "secondary"
                            : event.status === "attended"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>User's payment history and refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{transaction.event}</h4>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                      <Badge
                        variant={transaction.status === "completed" ? "secondary" : "destructive"}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

