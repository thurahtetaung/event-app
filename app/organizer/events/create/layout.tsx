import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new event and set up ticket sales",
}

export default function CreateEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}