import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Mail, MapPin, Phone, Calendar, Globe, FileText } from "lucide-react"
import { ApplicationActions } from "@/components/admin/ApplicationActions"

export const metadata: Metadata = {
  title: "Application Details",
  description: "Review organizer application details",
}

// In a real app, fetch this data from your API
const mockApplication = {
  id: "1",
  orgName: "TechConf Inc.",
  email: "info@techconf.com",
  status: "pending",
  logo: "/placeholder.jpg",
  phone: "+1 (555) 123-4567",
  website: "https://techconf.com",
  location: "New York, USA",
  submittedDate: "February 15, 2024",
  documents: [
    { id: "1", name: "Business Registration", status: "verified" },
    { id: "2", name: "Tax Certificate", status: "pending" },
    { id: "3", name: "Event Portfolio", status: "verified" },
  ],
  previousEvents: [
    {
      id: "1",
      name: "Tech Summit 2023",
      date: "2023-09-15",
      attendees: 1200,
      revenue: 89000,
    },
    {
      id: "2",
      name: "Developer Conference",
      date: "2023-06-20",
      attendees: 800,
      revenue: 64000,
    },
  ],
  team: [
    {
      id: "1",
      name: "John Smith",
      role: "Event Director",
      experience: "10+ years in tech events",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Operations Manager",
      experience: "8 years in event management",
    },
  ],
}

interface ApplicationDetailsPageProps {
  params: {
    id: string
  }
}

export default function ApplicationDetailsPage({ params }: ApplicationDetailsPageProps) {
  // In a real app, fetch application data here
  const application = mockApplication
  if (!application) notFound()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">Review organizer application</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/applications">Back to Applications</Link>
        </Button>
      </div>

      {/* Organization Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
              <Image
                src={application.logo}
                alt={application.orgName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold truncate">{application.orgName}</h2>
                  <p className="text-muted-foreground">{application.email}</p>
                </div>
                <ApplicationActions applicationId={application.id} applicationStatus={application.status} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{application.orgName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{application.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{application.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted {application.submittedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="events">Previous Events</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Verification status of submitted documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                    <Badge
                      variant={doc.status === "verified" ? "secondary" : "default"}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>Past events organized by the applicant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.previousEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">{event.attendees.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">attendees</span>
                      </div>
                      <div>
                        <span className="font-medium">${event.revenue.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">revenue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Key personnel and their experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.team.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border space-y-2"
                  >
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm font-medium text-muted-foreground">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.experience}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

