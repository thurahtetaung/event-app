import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { status } = await request.json()

  // In a real application, you would update the application status in the database
  console.log(`Updating application ${params.id} status to ${status}`)

  return NextResponse.json({ message: "Application status updated successfully" })
}

