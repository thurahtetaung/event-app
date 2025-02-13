"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface EventAttendeeChartProps {
  eventId: string
}

// Mock data - in a real app, this would be fetched based on eventId
const data = [
  { date: "2024-03-01", attendees: 25 },
  { date: "2024-03-02", attendees: 45 },
  { date: "2024-03-03", attendees: 65 },
  { date: "2024-03-04", attendees: 120 },
  { date: "2024-03-05", attendees: 180 },
  { date: "2024-03-06", attendees: 210 },
  { date: "2024-03-07", attendees: 280 },
  { date: "2024-03-08", attendees: 320 },
]

export function EventAttendeeChart({ eventId }: EventAttendeeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            })
          }}
        />
        <YAxis />
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
                        Attendees
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
        <Legend />
        <Bar dataKey="attendees" fill="#0ea5e9" name="Attendees" />
      </BarChart>
    </ResponsiveContainer>
  )
}