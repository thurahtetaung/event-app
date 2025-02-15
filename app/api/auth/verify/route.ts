import { NextResponse } from "next/server"
import { z } from "zod"
import { SignJWT } from "jose"
import { nanoid } from "nanoid"

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp } = verifySchema.parse(body)
    console.log("email is", email)
    console.log("otp is", otp)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would:
    // 1. Verify the OTP against stored hash
    // 2. Check if it's for registration or login
    // 3. For registration:
    //    - Create the user account
    //    - Move data from temporary storage
    // 4. For login:
    //    - Verify user exists
    // 5. Generate session token
    // 6. Clear used OTP

    // Mock validation - in real app, verify against stored OTP
    if (otp !== "123456") {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Generate a proper JWT token
    const token = await new SignJWT({
      email,
      jti: nanoid(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key"))

    return NextResponse.json({
      message: "Verification successful",
      token,
    })
  } catch (error) {
    console.log("error is", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Verification error:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}