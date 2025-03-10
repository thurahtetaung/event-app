"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Settings, BarChart, Loader2 } from "lucide-react"
import RecentApplications from "@/components/admin/RecentApplications"
import UserStats from "@/components/admin/UserStats"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"

interface PendingStats {
  total: number
  newSinceYesterday: number
}

interface DashboardStats {
  users: {
    total: number
    growthRate: number
    newSinceLastMonth: number
  }
  revenue: {
    total: number
    growthRate: number
    newSinceLastMonth: number
  }
  platformFee: {
    currentRate: number
    lastChanged: string
  }
}

function UserStatsLoading() {
  return (
    <div className="h-[350px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

export default function AdminDashboard() {
  const [pendingStats, setPendingStats] = useState<PendingStats | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch both stats in parallel
        const [pendingData, dashboardData] = await Promise.all([
          apiClient.organizerApplications.getPendingStats(),
          apiClient.admin.dashboard.getStats()
        ])

        setPendingStats(pendingData as PendingStats)
        setDashboardStats(dashboardData as DashboardStats)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
        <p className="text-muted-foreground">Here's what's happening with your platform today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{dashboardStats?.users.growthRate || 0}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingStats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{pendingStats?.newSinceYesterday || 0} new since yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats?.platformFee.currentRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Last changed {new Date(dashboardStats?.platformFee.lastChanged || Date.now()).toLocaleDateString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${dashboardStats?.revenue.total.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.revenue.growthRate || 0}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentApplications />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<UserStatsLoading />}>
              <UserStats />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

