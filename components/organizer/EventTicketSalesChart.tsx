"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface EventTicketSalesChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  {
    date: "2024-03-01",
    sales: 15,
  },
  {
    date: "2024-03-02",
    sales: 20,
  },
  {
    date: "2024-03-03",
    sales: 25,
  },
  {
    date: "2024-03-04",
    sales: 45,
  },
  {
    date: "2024-03-05",
    sales: 60,
  },
  {
    date: "2024-03-06",
    sales: 35,
  },
  {
    date: "2024-03-07",
    sales: 70,
  },
  {
    date: "2024-03-08",
    sales: 50,
  },
]

export function EventTicketSalesChart({ eventId }: EventTicketSalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
                        Tickets Sold
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
        <Bar
          dataKey="sales"
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}