import { NextResponse } from "next/server"
import { z } from "zod"

const resendSchema = z.object({
  email: z.string().email(),
})

// In a real app, this would be stored in a database with proper cleanup
const resendCooldowns = new Map<string, number>()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    // Check cooldown
    const lastResend = resendCooldowns.get(email)
    const now = Date.now()
    if (lastResend) {
      const timeElapsed = now - lastResend
      const cooldownPeriod = 60 * 1000 // 60 seconds in milliseconds

      if (timeElapsed < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000)
        return NextResponse.json(
          {
            message: "Please wait before requesting another code",
            remainingTime
          },
          { status: 429 }
        )
      }
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would:
    // 1. Verify the email exists in pending verifications
    // 2. Generate new OTP
    // 3. Send new OTP via email
    // 4. Update stored OTP hash and expiration

    // Update cooldown
    resendCooldowns.set(email, now)

    // Cleanup old cooldowns (in a real app, this would be handled by a scheduled job)
    Array.from(resendCooldowns.entries()).forEach(([email, timestamp]) => {
      if (now - timestamp > 60 * 1000) {
        resendCooldowns.delete(email)
      }
    })

    return NextResponse.json({
      message: "New verification code sent",
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
