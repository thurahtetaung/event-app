import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manage Events",
  description: "View and manage your events",
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
