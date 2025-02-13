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

interface ConversionRateChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  {
    date: "Jan 1",
    pageViews: 1200,
    ticketSales: 180,
    conversionRate: 15,
  },
  {
    date: "Jan 2",
    pageViews: 1500,
    ticketSales: 240,
    conversionRate: 16,
  },
  {
    date: "Jan 3",
    pageViews: 1800,
    ticketSales: 360,
    conversionRate: 20,
  },
  {
    date: "Jan 4",
    pageViews: 2200,
    ticketSales: 484,
    conversionRate: 22,
  },
  {
    date: "Jan 5",
    pageViews: 2500,
    ticketSales: 625,
    conversionRate: 25,
  },
]

export function ConversionRateChart({ eventId }: ConversionRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Page Views
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Ticket Sales
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[1].value}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Conversion Rate
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[2].value}%
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
          yAxisId="left"
          type="monotone"
          dataKey="pageViews"
          stroke="#2563eb"
          strokeWidth={2}
          name="Page Views"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="ticketSales"
          stroke="#16a34a"
          strokeWidth={2}
          name="Ticket Sales"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversionRate"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Conversion Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}