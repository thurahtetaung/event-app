"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  { category: "Music", count: 45 },
  { category: "Technology", count: 38 },
  { category: "Business", count: 32 },
  { category: "Food & Drink", count: 28 },
  { category: "Arts", count: 25 },
  { category: "Sports", count: 22 },
  { category: "Education", count: 18 },
]

export function EventCategoriesChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="category" />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="count"
          fill="#0ea5e9"
          name="Number of Events"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}