"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationCard } from "@/components/admin/ApplicationCard"
import { Application } from "@/types/admin"

// Mock data with 10 applications (6 pending, 2 approved, 2 rejected)
const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: "1",
    status: "pending",
    submittedAt: "2024-02-15T10:30:00Z",
    user: {
      id: "user1",
      email: "john.smith@events.com",
      name: "John Smith",
    },
    organizationName: "TechConf Solutions",
    organizationType: "company",
  },
  {
    id: "2",
    status: "pending",
    submittedAt: "2024-02-15T09:15:00Z",
    user: {
      id: "user2",
      email: "emma.johnson@productions.co",
      name: "Emma Johnson",
    },
    organizationName: "Festival Hub",
    organizationType: "company",
  },
  {
    id: "3",
    status: "pending",
    submittedAt: "2024-02-14T16:45:00Z",
    user: {
      id: "user3",
      email: "michael.williams@group.com",
      name: "Michael Williams",
    },
    organizationName: "Sports United",
    organizationType: "company",
  },
  {
    id: "4",
    status: "approved",
    submittedAt: "2024-02-13T14:20:00Z",
    user: {
      id: "user4",
      email: "sarah.brown@org.com",
      name: "Sarah Brown",
    },
    organizationName: "Arts & Culture Events",
    organizationType: "non_profit",
  },
  {
    id: "5",
    status: "pending",
    submittedAt: "2024-02-15T11:30:00Z",
    user: {
      id: "user5",
      email: "david.jones@events.io",
      name: "David Jones",
    },
    organizationName: "Business Summit Pro",
    organizationType: "company",
  },
  {
    id: "6",
    status: "rejected",
    submittedAt: "2024-02-12T15:30:00Z",
    user: {
      id: "user6",
      email: "lisa.garcia@company.co",
      name: "Lisa Garcia",
    },
    organizationName: "Community Gatherings",
    organizationType: "non_profit",
  },
  {
    id: "7",
    status: "pending",
    submittedAt: "2024-02-14T13:45:00Z",
    user: {
      id: "user7",
      email: "james.miller@events.com",
      name: "James Miller",
    },
    organizationName: "Music Festival Co",
    organizationType: "company",
  },
  {
    id: "8",
    status: "approved",
    submittedAt: "2024-02-13T11:20:00Z",
    user: {
      id: "user8",
      email: "sophia.davis@productions.co",
      name: "Sophia Davis",
    },
    organizationName: "Education Events",
    organizationType: "company",
  },
  {
    id: "9",
    status: "pending",
    submittedAt: "2024-02-15T08:30:00Z",
    user: {
      id: "user9",
      email: "oliver.wilson@group.com",
      name: "Oliver Wilson",
    },
    organizationName: "Food & Wine Expo",
    organizationType: "company",
  },
  {
    id: "10",
    status: "rejected",
    submittedAt: "2024-02-12T16:15:00Z",
    user: {
      id: "user10",
      email: "ava.martinez@org.com",
      name: "Ava Martinez",
    },
    organizationName: "Gaming Convention X",
    organizationType: "company",
  },
]

export default function ApplicationsPage() {
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
            Pending ({SAMPLE_APPLICATIONS.filter(app => app.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({SAMPLE_APPLICATIONS.filter(app => app.status === "approved").length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({SAMPLE_APPLICATIONS.filter(app => app.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {SAMPLE_APPLICATIONS
            .filter(app => app.status === "pending")
            .map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
        </TabsContent>

        <TabsContent value="approved">
          {SAMPLE_APPLICATIONS
            .filter(app => app.status === "approved")
            .map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
        </TabsContent>

        <TabsContent value="rejected">
          {SAMPLE_APPLICATIONS
            .filter(app => app.status === "rejected")
            .map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

