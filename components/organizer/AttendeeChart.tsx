"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface AttendeeChartProps {
  data: Array<{
    month: string;
    count: number;
  }>;
}

// Fallback data if no data is provided
const fallbackData = [
  { month: "Jan", attendees: 0 },
  { month: "Feb", attendees: 0 },
  { month: "Mar", attendees: 0 },
  { month: "Apr", attendees: 0 },
  { month: "May", attendees: 0 },
  { month: "Jun", attendees: 0 },
]

export function AttendeeChart({ data }: AttendeeChartProps) {
  // Transform the data for the chart
  const chartData = data.length > 0
    ? data.map(item => ({
        month: new Date(item.month + "-01").toLocaleString('default', { month: 'short' }),
        attendees: item.count
      }))
    : fallbackData;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Month
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.month}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Total Attendees
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}
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
        <Bar dataKey="attendees" fill="#0ea5e9" name="Total Attendees" />
      </BarChart>
    </ResponsiveContainer>
  )
}

