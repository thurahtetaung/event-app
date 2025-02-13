"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", users: 100 },
  { month: "Feb", users: 220 },
  { month: "Mar", users: 380 },
  { month: "Apr", users: 450 },
  { month: "May", users: 620 },
  { month: "Jun", users: 750 },
  { month: "Jul", users: 890 },
  { month: "Aug", users: 1020 },
  { month: "Sep", users: 1150 },
  { month: "Oct", users: 1380 },
  { month: "Nov", users: 1580 },
  { month: "Dec", users: 1890 },
]

export function UserGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis
          dataKey="month"
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
        <Tooltip />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#2563eb"
          fill="#3b82f6"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

