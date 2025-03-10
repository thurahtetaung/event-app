"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface MonthlyStats {
  month: string
  total: number
}

interface MonthlyUserStatsResponse {
  data: MonthlyStats[]
}

export default function UserStats() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMonthlyStats() {
      try {
        // Fetch real monthly user registration data from the API
        const response = await apiClient.admin.dashboard.getMonthlyUserStats() as MonthlyUserStatsResponse
        setData(response.data)
      } catch (error) {
        console.error("Error fetching user stats:", error)
        // Fallback to sample data if there's an error
        setData([
          { month: "Jan", total: 1200 },
          { month: "Feb", total: 1900 },
          { month: "Mar", total: 2300 },
          { month: "Apr", total: 3200 },
          { month: "May", total: 4100 },
          { month: "Jun", total: 4800 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthlyStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke={isDark ? "#a1a1aa" : "#71717a"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={isDark ? "#a1a1aa" : "#71717a"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{
            color: isDark ? "hsl(var(--card-foreground))" : "hsl(var(--card-foreground))"
          }}
        />
        <Bar
          dataKey="total"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          opacity={0.9}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

