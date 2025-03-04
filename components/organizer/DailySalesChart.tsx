"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"

interface DailySalesChartProps {
  data: Array<{
    date: string
    count: number
    revenue: number
  }>
}

export function DailySalesChart({ data }: DailySalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
        <p className="text-sm">No sales data available yet</p>
        <p className="text-xs">Sales data will appear here once tickets are sold</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM d")}
        />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {format(new Date(payload[0].payload.date), "MMM d, yyyy")}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        ${payload[0].value} revenue
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {payload[1].value} tickets sold
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stackId="1"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="count"
          stackId="2"
          stroke="#16a34a"
          fill="#16a34a"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}