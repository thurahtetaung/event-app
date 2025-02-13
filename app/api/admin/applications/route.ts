import { NextResponse } from "next/server"

const mockApplications = [
  { id: 1, orgName: "Event Masters", email: "info@eventmasters.com", status: "pending" },
  { id: 2, orgName: "Concert Kings", email: "contact@concertkings.com", status: "approved" },
  { id: 3, orgName: "Sports Events Inc.", email: "hello@sportsevents.com", status: "rejected" },
]

export async function GET() {
  return NextResponse.json(mockApplications)
}

