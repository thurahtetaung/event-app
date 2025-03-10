"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { apiClient, MonthlyRevenueData } from "@/lib/api-client"
import { Card, CardContent } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

// Custom tooltip styles for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-900 p-3 rounded-md shadow-md border border-gray-200">
        <p className="font-medium">Revenue for {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="flex items-center gap-2">
            <span className="font-medium">{entry.name || 'Revenue'}:</span>
            <span className="text-gray-700">${entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  const [data, setData] = useState<MonthlyRevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const revenueData = await apiClient.getAdminMonthlyRevenue()
        setData(revenueData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch revenue data:", err)
        setError("Failed to load revenue data")
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
      <LineChart data={formattedData}>
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
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#adfa1d"
          strokeWidth={2}
          dot={false}
          name="Platform Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

