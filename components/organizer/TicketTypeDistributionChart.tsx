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

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#94a3b8"]

export function TicketTypeDistributionChart({ data }: TicketTypeDistributionChartProps) {
  console.log("Ticket stats data:", data);

  // Use quantity for distribution instead of sold tickets
  const chartData = data.map(ticket => ({
    name: ticket.name,
    value: ticket.quantity, // Use total quantity for distribution
    label: `${ticket.totalSold} / ${ticket.quantity} sold`
  }))

  console.log("Transformed chart data:", chartData);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No ticket types available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
                        {data.label}
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