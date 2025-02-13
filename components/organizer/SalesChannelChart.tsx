"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"

interface SalesChannelChartProps {
  eventId: string
}

const data = [
  { name: "Website", value: 45, color: "#0ea5e9" },
  { name: "Mobile App", value: 30, color: "#22c55e" },
  { name: "Partners", value: 15, color: "#f59e0b" },
  { name: "Box Office", value: 10, color: "#6366f1" },
]

export function SalesChannelChart({ eventId }: SalesChannelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}