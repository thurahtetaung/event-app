import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage applications, users, and platform settings",
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}