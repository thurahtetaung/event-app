import { NextResponse } from "next/server"

const mockUsers = [
  { id: 1, email: "user1@example.com", role: "user", status: "active" },
  { id: 2, email: "organizer1@example.com", role: "organizer", status: "active" },
  { id: 3, email: "admin1@example.com", role: "admin", status: "active" },
  { id: 4, email: "banneduser@example.com", role: "user", status: "banned" },
]

export async function GET() {
  return NextResponse.json(mockUsers)
}

