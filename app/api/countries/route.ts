import { NextResponse } from "next/server"

const SOUTHEAST_ASIA_COUNTRIES = [
  { code: "BN", name: "Brunei" },
  { code: "KH", name: "Cambodia" },
  { code: "TL", name: "East Timor" },
  { code: "ID", name: "Indonesia" },
  { code: "LA", name: "Laos" },
  { code: "MY", name: "Malaysia" },
  { code: "MM", name: "Myanmar" },
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
]

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({
    countries: SOUTHEAST_ASIA_COUNTRIES,
    defaultCountry: "SG" // Default to Singapore
  })
}