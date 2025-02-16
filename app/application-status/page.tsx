"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/AuthContext"

interface ApplicationStatus {
  id: string
  status: "pending" | "approved" | "rejected"
  organizationName: string
  rejectionReason?: string
  createdAt: string
}

export default function ApplicationStatusPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<ApplicationStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;

    async function fetchApplicationStatus() {
      try {
        const data = await apiClient.organizerApplications.getByUserId()
        if (isMounted) {
          setApplications(data as ApplicationStatus[])
        }
      } catch (error: unknown) {
        if (isMounted) {
          if (error instanceof Error && error.message.includes("No organizer application found")) {
            router.push("/become-organizer")
          } else if (error instanceof Error && !error.message.includes('Request was cancelled')) {
            setError(error.message || "Failed to fetch application status")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchApplicationStatus()
    }

    return () => {
      isMounted = false
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Loading application status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => router.push("/become-organizer")}>
                Apply to Become an Organizer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!applications.length) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p>You haven't submitted any organizer applications yet.</p>
              <Button onClick={() => router.push("/become-organizer")}>
                Apply to Become an Organizer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasPendingApplication = applications.some(app => app.status === "pending")

  return (
    <div className="container max-w-lg py-10 space-y-6">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Status of your organizer application for {application.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  application.status === "approved"
                    ? "text-green-600"
                    : application.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Submitted on:</span>
                <span>{new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {application.status === "pending" && (
              <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 text-sm">
                <p>
                  Your application is currently under review. We will notify you via email once a decision has been made.
                </p>
              </div>
            )}

            {application.status === "rejected" && application.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">Reason for rejection:</p>
                <p>{application.rejectionReason}</p>
              </div>
            )}

            {application.status === "approved" && (
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 rounded-lg p-4 text-sm">
                <p>
                  Congratulations! Your application has been approved. You can now start creating and managing events.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {!hasPendingApplication && (
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Homepage
          </Button>
          <Button onClick={() => router.push("/become-organizer")}>
            Submit New Application
          </Button>
        </div>
      )}

      {hasPendingApplication && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Homepage
          </Button>
        </div>
      )}
    </div>
  )
}