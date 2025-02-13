import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// In a real app, you would store OTPs in a database with expiration
const MOCK_OTP = "123456"

// Helper function to determine user role from email
function getUserDataFromEmail(email: string) {
  if (email.includes("admin")) {
    return { email, role: "admin" }
  }
  if (email.includes("organizer")) {
    return { email, role: "organizer" }
  }
  return { email, role: "user" }
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return new NextResponse("Email and OTP are required", { status: 400 })
    }

    // In a real app, verify OTP from database and check expiration
    if (otp !== MOCK_OTP) {
      return new NextResponse("Invalid OTP", { status: 401 })
    }

    // Get user data based on email pattern
    const userData = getUserDataFromEmail(email)

    // Generate JWT token
    const token = sign(
      { email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[VERIFY_OTP]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

