"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Loader2, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { Application } from "@/types/admin"

export default function RecentApplications() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await apiClient.organizerApplications.getAll()
        // Sort by createdAt and take the 5 most recent applications
        const sortedApplications = (data as Application[])
          .sort((a, b) => new Date(b.application.createdAt).getTime() - new Date(a.application.createdAt).getTime())
          .slice(0, 5)
        setApplications(sortedApplications)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!applications.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No applications found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Applicant</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-4"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow
            key={app.application.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => router.push(`/admin/applications/${app.application.id}`)}
          >
            <TableCell className="font-medium">
              {app.application.organizationName}
            </TableCell>
            <TableCell>{app.applicant.email}</TableCell>
            <TableCell>
              {format(new Date(app.application.createdAt), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  app.application.status === "approved"
                    ? "success"
                    : app.application.status === "rejected"
                    ? "destructive"
                    : "default"
                }
                className={app.application.status === "pending" ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
              >
                {app.application.status}
              </Badge>
            </TableCell>
            <TableCell>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

