"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

// Organization-level data showing monthly attendee statistics
const data = [
  { month: "Jan", attendees: 1200 },
  { month: "Feb", attendees: 1500 },
  { month: "Mar", attendees: 1800 },
  { month: "Apr", attendees: 2200 },
  { month: "May", attendees: 2600 },
  { month: "Jun", attendees: 3100 },
  { month: "Jul", attendees: 3500 },
  { month: "Aug", attendees: 4000 },
]

export function AttendeeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Month
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.month}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Total Attendees
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
        <Bar dataKey="attendees" fill="#0ea5e9" name="Total Attendees" />
      </BarChart>
    </ResponsiveContainer>
  )
}

