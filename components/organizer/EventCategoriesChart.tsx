"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface EventCategoriesChartProps {
  data: Array<{
    category: string;
    count: number;
  }>;
}

// Fallback data if no data is provided
const fallbackData = [
  { category: "No categories", count: 0 },
]

export function EventCategoriesChart({ data }: EventCategoriesChartProps) {
  // Use provided data or fallback if empty
  const chartData = data.length > 0 ? data : fallbackData;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
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