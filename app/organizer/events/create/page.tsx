"use client"

import { EventCreationForm } from "@/components/events/EventCreationForm"

export default function CreateEventPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container py-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-8 text-3xl font-bold">Create Event</h1>
            <EventCreationForm />
          </div>
        </div>
      </div>
    </div>
  )
}

