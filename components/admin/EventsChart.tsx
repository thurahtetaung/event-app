"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { apiClient, EventStatistics } from "@/lib/api-client"
import { Skeleton } from "../ui/skeleton"
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Custom tooltip styles for dark mode
// Define specific types for props instead of using any
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-900 p-3 rounded-md shadow-md border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="flex items-center gap-2">
            <span className="font-medium">{entry.name}:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {entry.name === "Occupancy Rate" ? `${entry.value}%` : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EventsChart() {
  const [data, setData] = useState<EventStatistics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const statistics = await apiClient.getAdminEventStatistics()
        console.log("Event statistics data:", statistics)

        // Add placeholder values for testing if they don't exist
        const enhancedData = statistics.map(item => {
          // Calculate average tickets per event (if not provided by backend)
          const avgTickets = item.averageTicketsPerEvent ?? // Use backend value first
                            (item.newEvents > 0 ? Math.round(item.ticketsSold / item.newEvents) : 0);

          // Use the occupancy rate directly from the backend
          // The backend now calculates this correctly, including 0% for months with no capacity/events
          const occupancyRate = item.eventOccupancyRate;

          return {
            ...item,
            averageTicketsPerEvent: avgTickets,
            eventOccupancyRate: occupancyRate // Use the accurate backend value
          };
        })

        setData(enhancedData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch event statistics:", err)
        setError("Failed to load event data")
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
      <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
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
        <Legend />
        <Bar
          dataKey="averageTicketsPerEvent"
          name="Avg. Tickets Per Event"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
        <Bar
          dataKey="eventOccupancyRate"
          name="Occupancy Rate"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}