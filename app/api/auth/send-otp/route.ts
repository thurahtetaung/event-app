import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return new NextResponse("Email is required", { status: 400 })
    }

    // In a real app, you would:
    // 1. Generate a random OTP
    // 2. Store it in a database with expiration
    // 3. Send it via email
    // For this example, we'll just simulate success
    // The OTP will be 123456 for testing

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return new NextResponse("OTP sent successfully", { status: 200 })
  } catch (error) {
    console.error("[SEND_OTP]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

