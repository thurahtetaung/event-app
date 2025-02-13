"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

interface DailySalesChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  {
    day: "Mon",
    thisWeek: 45,
    lastWeek: 30,
  },
  {
    day: "Tue",
    thisWeek: 52,
    lastWeek: 42,
  },
  {
    day: "Wed",
    thisWeek: 48,
    lastWeek: 35,
  },
  {
    day: "Thu",
    thisWeek: 70,
    lastWeek: 50,
  },
  {
    day: "Fri",
    thisWeek: 90,
    lastWeek: 65,
  },
  {
    day: "Sat",
    thisWeek: 120,
    lastWeek: 85,
  },
  {
    day: "Sun",
    thisWeek: 95,
    lastWeek: 75,
  },
]

export function DailySalesChart({ eventId }: DailySalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
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
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        This Week
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value} tickets
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Last Week
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[1].value} tickets
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
        <Line
          type="monotone"
          dataKey="thisWeek"
          stroke="#2563eb"
          strokeWidth={2}
          name="This Week"
        />
        <Line
          type="monotone"
          dataKey="lastWeek"
          stroke="#94a3b8"
          strokeWidth={2}
          name="Last Week"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}