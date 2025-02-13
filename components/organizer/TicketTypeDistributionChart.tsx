"use client"

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

interface TicketTypeDistributionChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  {
    type: "Early Bird",
    value: 250,
  },
  {
    type: "Regular",
    value: 350,
  },
  {
    type: "VIP",
    value: 80,
  },
  {
    type: "Student",
    value: 50,
  },
]

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#94a3b8"]

export function TicketTypeDistributionChart({ eventId }: TicketTypeDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="type"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {payload[0].name}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].value} tickets
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
      </PieChart>
    </ResponsiveContainer>
  )
}