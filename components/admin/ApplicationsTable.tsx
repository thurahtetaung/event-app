"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Application {
  id: number
  orgName: string
  email: string
  status: "pending" | "approved" | "rejected"
}

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error("Failed to fetch applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  const handleStatusChange = async (id: number, newStatus: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchApplications()
      } else {
        console.error("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.orgName}</TableCell>
            <TableCell>{app.email}</TableCell>
            <TableCell>{app.status}</TableCell>
            <TableCell>
              {app.status === "pending" && (
                <>
                  <Button onClick={() => handleStatusChange(app.id, "approved")} className="mr-2">
                    Approve
                  </Button>
                  <Button onClick={() => handleStatusChange(app.id, "rejected")} variant="destructive">
                    Reject
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

