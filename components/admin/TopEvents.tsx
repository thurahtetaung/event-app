import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const topEvents = [
  { id: 1, name: "Summer Music Festival", tickets: 5000, revenue: 250000 },
  { id: 2, name: "Tech Conference 2023", tickets: 3000, revenue: 180000 },
  { id: 3, name: "Food & Wine Expo", tickets: 2500, revenue: 125000 },
  { id: 4, name: "International Film Festival", tickets: 2000, revenue: 100000 },
  { id: 5, name: "Marathon City Run", tickets: 1500, revenue: 75000 },
]

export default function TopEvents() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Tickets Sold</TableHead>
          <TableHead>Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topEvents.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.name}</TableCell>
            <TableCell>{event.tickets}</TableCell>
            <TableCell>${event.revenue.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

