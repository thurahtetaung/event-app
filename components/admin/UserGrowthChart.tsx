"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { apiClient, UserGrowthData } from "@/lib/api-client"
import { Skeleton } from "../ui/skeleton"

// Custom tooltip styles for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-900 p-3 rounded-md shadow-md border border-gray-200">
        <p className="font-medium">User growth for {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="flex items-center gap-2">
            <span className="font-medium">{entry.name}:</span>
            <span className="text-gray-700">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function UserGrowthChart() {
  const [data, setData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const growthData = await apiClient.getAdminUserGrowth()
        setData(growthData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch user growth data:", err)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Skeleton className="w-full h-[350px]" />
  }

  if (error) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  // Create display labels for month/year
  const formattedData = data.map(item => ({
    ...item,
    label: `${item.month} ${item.year.toString().slice(2)}` // e.g., "Jan 23"
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={formattedData}>
        <XAxis
          dataKey="label"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalUsers"
          stroke="#2563eb"
          fill="#3b82f6"
          strokeWidth={2}
          name="Total Users"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

