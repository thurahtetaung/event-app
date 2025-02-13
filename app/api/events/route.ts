import { NextResponse } from "next/server"

const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "2023-07-15",
    price: 50,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Tech Conference 2023",
    date: "2023-08-22",
    price: 100,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Art Exhibition",
    date: "2023-09-10",
    price: 25,
    image: "/placeholder.svg?height=200&width=300",
  },
  // Add more mock events as needed
]

export async function GET(request: Request) {
  // Simulate a delay to test loading state
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate an error occasionally to test error handling
  if (Math.random() < 0.1) {
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  // In a real application, you would apply filters and sorting based on query parameters
  const { searchParams } = new URL(request.url)
  console.log("Filters:", Object.fromEntries(searchParams))

  return NextResponse.json(mockEvents)
}

export async function POST(request: Request) {
  const eventData = await request.json()

  // In a real application, you would save the event data to a database
  console.log("Creating event:", eventData)

  return NextResponse.json({ message: "Event created successfully", id: Date.now() })
}

