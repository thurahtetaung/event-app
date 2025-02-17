"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { format } from "date-fns"

interface TicketInventoryChartProps {
  data: Array<{
    id: string
    name: string
    type: "free" | "paid"
    totalSold: number
    totalRevenue: number
    status: "on-sale" | "paused" | "sold-out" | "scheduled"
    quantity: number
  }>
}

export function TicketInventoryChart({ data }: TicketInventoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
        <p className="text-sm">No ticket types available</p>
        <p className="text-xs">Create ticket types to see their performance</p>
      </div>
    )
  }

  const chartData = data.map(ticket => ({
    name: ticket.name,
    sold: ticket.totalSold,
    available: ticket.quantity - ticket.totalSold,
    status: ticket.status,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {data.name}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {data.sold} sold
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.available} available
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        Status: {data.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        <Bar dataKey="sold" stackId="a" fill="#2563eb" name="Sold" />
        <Bar dataKey="available" stackId="a" fill="#94a3b8" name="Available" />
      </BarChart>
    </ResponsiveContainer>
  )
}