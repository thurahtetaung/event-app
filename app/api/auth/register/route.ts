import { NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  country: z.string().length(2),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would:
    // 1. Check if email already exists
    // 2. Store user data in a temporary storage or with a pending status
    // 3. Generate and send OTP via email
    // 4. Store OTP hash in the database with an expiration

    return NextResponse.json({
      message: "Registration initiated. Please check your email for the verification code.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}