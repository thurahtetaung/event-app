import { NextResponse } from "next/server"

const mockEvent = {
  id: 1,
  title: "Summer Music Festival",
  date: "2023-07-15",
  description: "Join us for an unforgettable summer music experience featuring top artists from around the world.",
  tickets: [
    { id: 1, type: "General Admission", price: 50, available: 100 },
    { id: 2, type: "VIP", price: 100, available: 50 },
    { id: 3, type: "Backstage Pass", price: 200, available: 10 },
  ],
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // In a real application, you would fetch the event details from a database
  console.log("Fetching event details for ID:", params.id)

  return NextResponse.json(mockEvent)
}

