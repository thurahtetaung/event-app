"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  if (user) {
    return null // Return null to prevent flash of content during redirect
  }

  return (
    <div className="container flex flex-col items-center justify-center space-y-12 py-20">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Your One-Stop Platform for Event Ticketing
        </h1>
        <p className="text-lg text-muted-foreground">
          Create, manage, and discover events. Simple ticketing solutions for organizers and attendees.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login?as=organizer">Create Events</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">For Attendees</h3>
          <p className="text-muted-foreground">
            Discover and book tickets for events happening near you. Simple, secure payments.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">For Organizers</h3>
          <p className="text-muted-foreground">
            Powerful tools to create, manage and promote your events. Real-time analytics included.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Secure & Reliable</h3>
          <p className="text-muted-foreground">
            Built with security in mind. Instant ticket delivery and validation.
          </p>
        </div>
      </div>
    </div>
  )
}