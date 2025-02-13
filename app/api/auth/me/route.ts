import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface JWTPayload {
  email: string
  role: string
}

export async function GET() {
  try {
    const token = cookies().get("token")?.value

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
      // Verify and decode the JWT token
      const decoded = verify(token, JWT_SECRET) as JWTPayload

      // Return user data
      return NextResponse.json({
        email: decoded.email,
        role: decoded.role,
      })
    } catch (error) {
      console.error("[TOKEN_VERIFY]", error)
      return new NextResponse("Invalid token", { status: 401 })
    }
  } catch (error) {
    console.error("[AUTH_ME]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

