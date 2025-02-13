"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", events: 65 },
  { month: "Feb", events: 85 },
  { month: "Mar", events: 120 },
  { month: "Apr", events: 90 },
  { month: "May", events: 140 },
  { month: "Jun", events: 160 },
  { month: "Jul", events: 180 },
  { month: "Aug", events: 220 },
  { month: "Sep", events: 190 },
  { month: "Oct", events: 240 },
  { month: "Nov", events: 280 },
  { month: "Dec", events: 320 },
]

export function EventsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
        <Bar
          dataKey="events"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}