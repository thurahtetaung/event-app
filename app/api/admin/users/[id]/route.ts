import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { role, status } = await request.json()

  // In a real application, you would update the user role or status in the database
  console.log(`Updating user ${params.id} role to ${role} and status to ${status}`)

  return NextResponse.json({ message: "User updated successfully" })
}

