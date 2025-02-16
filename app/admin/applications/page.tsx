"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationCard } from "@/components/admin/ApplicationCard"
import { Application } from "@/types/admin"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;

    async function fetchApplications() {
      try {
        const data = await apiClient.organizerApplications.getAll()
        if (isMounted) {
          setApplications(data as Application[])
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes('Request was cancelled')) {
          console.error("Error fetching applications:", error)
          toast.error("Failed to load applications")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Organizer Applications</h1>
          <p className="text-muted-foreground">
            Review and manage organizer applications
          </p>
        </div>
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organizer Applications</h1>
        <p className="text-muted-foreground">
          Review and manage organizer applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({applications.filter(app => app.application.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({applications.filter(app => app.application.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(app => app.application.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {applications
            .filter(app => app.application.status === "pending")
            .map((application) => (
              <ApplicationCard
                key={application.application.id}
                application={application}
              />
            ))}
        </TabsContent>

        <TabsContent value="approved">
          {applications
            .filter(app => app.application.status === "approved")
            .map((application) => (
              <ApplicationCard
                key={application.application.id}
                application={application}
              />
            ))}
        </TabsContent>

        <TabsContent value="rejected">
          {applications
            .filter(app => app.application.status === "rejected")
            .map((application) => (
              <ApplicationCard
                key={application.application.id}
                application={application}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

