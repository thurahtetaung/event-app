import EventGrid from "@/components/events/EventGrid"
import EventFilters from "@/components/events/EventFilters"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-3xl font-bold">Event Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <EventFilters />
        </aside>
        <main className="w-full md:w-3/4">
          <EventGrid />
        </main>
      </div>
    </div>
  )
}

