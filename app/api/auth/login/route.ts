import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return new NextResponse("Token is required", { status: 400 })
    }

    // Set the token in an HTTP-only cookie
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days
      maxAge: 30 * 24 * 60 * 60
    })

    return new NextResponse("Login successful", { status: 200 })
  } catch (error) {
    console.error("[AUTH_LOGIN]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}