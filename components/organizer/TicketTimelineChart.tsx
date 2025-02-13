"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface TicketTimelineChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  {
    date: "2024-03-01",
    tickets: 25,
  },
  {
    date: "2024-03-02",
    tickets: 45,
  },
  {
    date: "2024-03-03",
    tickets: 65,
  },
  {
    date: "2024-03-04",
    tickets: 120,
  },
  {
    date: "2024-03-05",
    tickets: 180,
  },
  {
    date: "2024-03-06",
    tickets: 210,
  },
  {
    date: "2024-03-07",
    tickets: 280,
  },
  {
    date: "2024-03-08",
    tickets: 320,
  },
]

export function TicketTimelineChart({ eventId }: TicketTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })
          }}
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
                        Date
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {new Date(payload[0].payload.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Total Tickets
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
        <Area
          type="monotone"
          dataKey="tickets"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}