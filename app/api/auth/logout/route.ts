import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Delete the token cookie
    cookies().delete("token")

    return new NextResponse("Logged out successfully", { status: 200 })
  } catch (error) {
    console.error("[AUTH_LOGOUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}