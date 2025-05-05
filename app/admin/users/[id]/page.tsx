"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MapPin, Phone, Calendar, User2, CreditCard, Clock } from "lucide-react"
import { UserActions } from "@/components/admin/UserActions"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "user" | "organizer" | "admin"
  status: "active" | "inactive" | "banned"
  country: string
  dateOfBirth: string
  createdAt: string
  events?: Array<{
    id: string
    title: string
    startTimestamp: string
    status: string
    totalTickets: number
    ticketTypes: Array<{
      id: string
      name: string
      count: number
      price: number
    }>
  }>
  transactions?: Array<{
    id: string
    eventTitle: string
    amount: number
    createdAt: string
    status: string
    ticketCount: number
    paymentId?: string
    ticketTypes: Array<{
      name: string
      quantity: number
      unitPrice: number
    }>
  }>
  stats?: {
    totalSpent: number
    eventsAttended: number
    eventsUpcoming: number
    eventsCancelled: number
  }
}

// Placeholder for user avatar
const PLACEHOLDER_AVATAR = "https://ui-avatars.com/api/?background=random"

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid date"
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [userStats, setUserStats] = useState<UserData['stats'] | null>(null)
  const [userEvents, setUserEvents] = useState<UserData['events'] | null>(null)
  const [userTransactions, setUserTransactions] = useState<UserData['transactions'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch basic user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)

        // Directly call the backend API using the apiClient
        const userData = await apiClient.admin.users.getById(params.id as string)
        setUser(userData as UserData)
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Failed to load user data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!params.id) return

      try {
        setStatsLoading(true)
        const stats = await apiClient.admin.users.getStats(params.id as string)
        setUserStats(stats as UserData['stats'])
      } catch (error) {
        console.error("Error fetching user stats:", error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchUserStats()
  }, [params.id])

  // Fetch user events
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!params.id) return

      try {
        setEventsLoading(true)
        const events = await apiClient.admin.users.getEvents(params.id as string)
        setUserEvents(events as UserData['events'])
      } catch (error) {
        console.error("Error fetching user events:", error)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchUserEvents()
  }, [params.id])

  // Fetch user transactions
  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!params.id) return

      try {
        setTransactionsLoading(true)
        const transactions = await apiClient.admin.users.getTransactions(params.id as string)
        setUserTransactions(transactions as UserData['transactions'])
      } catch (error) {
        console.error("Error fetching user transactions:", error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    fetchUserTransactions()
  }, [params.id])

  const handleStatusChange = async (userId: string, newStatus: "active" | "inactive" | "banned") => {
    try {
      // Directly call the backend API using the apiClient
      await apiClient.admin.users.updateUser(userId, { status: newStatus })

      setUser(prev => prev ? { ...prev, status: newStatus } : null)
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update user status")
      console.error(error)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      // Directly call the backend API using the apiClient
      await apiClient.admin.users.deleteUser(userId)

      toast.success("User deleted successfully")
      router.push("/admin/users")
    } catch (error) {
      toast.error("Failed to delete user")
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <p>Loading user data...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-8 flex flex-col items-center">
        <p className="text-destructive mb-4">{error || "User not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    )
  }

  // Generate avatar URL with user's name
  const avatarUrl = `${PLACEHOLDER_AVATAR}&name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`

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
                src={avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold truncate">{`${user.firstName} ${user.lastName}`}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <UserActions
                  userId={user.id}
                  userStatus={user.status}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User2 className="h-4 w-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
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
            {statsLoading ? (
              <div className="h-9 flex items-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${userStats?.totalSpent?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">Lifetime spending</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-9 flex items-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{userStats?.eventsAttended || 0}</div>
                <p className="text-xs text-muted-foreground">Total events attended</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-9 flex items-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{userStats?.eventsUpcoming || 0}</div>
                <p className="text-xs text-muted-foreground">Events booked</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-9 flex items-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{userStats?.eventsCancelled || 0}</div>
                <p className="text-xs text-muted-foreground">Cancelled bookings</p>
              </>
            )}
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
              {eventsLoading ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : userEvents && userEvents.length > 0 ? (
                <EventsSection events={userEvents} />
              ) : (
                <p className="text-center text-muted-foreground py-4">No events found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>User's payment history</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              ) : userTransactions && userTransactions.length > 0 ? (
                <div className="space-y-4">
                  {userTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col p-4 rounded-lg border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{transaction.eventTitle}</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>{formatDate(transaction.createdAt)}</p>
                            <p>Order ID: {transaction.id.substring(0, 8)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                          <Badge
                            variant={transaction.status === "completed" ? "secondary" : "destructive"}
                          >
                            {transaction.status === "completed" ? "Paid" : transaction.status}
                          </Badge>
                          {transaction.paymentId && transaction.paymentId !== "Free order" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Payment: {transaction.paymentId.substring(0, 10)}...
                            </p>
                          )}
                          {transaction.paymentId === "Free order" && (
                            <p className="text-xs text-muted-foreground mt-1">Free tickets</p>
                          )}
                        </div>
                      </div>

                      {/* Ticket types breakdown */}
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="font-medium mb-1">Ticket breakdown:</p>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-muted-foreground">
                          {transaction.ticketTypes.map((ticket, idx) => (
                            <div key={idx} className="contents">
                              <span>{ticket.name}</span>
                              <span className="text-center">{ticket.quantity}×</span>
                              <span className="text-right">${ticket.unitPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-sm font-medium flex justify-between">
                          <span>Total: {transaction.ticketCount} tickets</span>
                          <span>${transaction.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const EventsSection = ({ events }: { events: UserData["events"] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-muted-foreground">No events found for this user.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-md border p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.startTimestamp)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Total tickets:</span> {event.totalTickets}
                </p>
                {event.ticketTypes.map((type) => (
                  <p key={type.id} className="text-sm">
                    <span className="font-medium">{type.name}:</span> {type.count} x ${type.price.toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
            <Badge variant={event.status === "attended" ? "default" : "outline"}>
              {event.status === "attended" ? "Attended" : "Upcoming"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

