"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ApproveModal } from "@/components/admin/ApproveModal"
import { RejectModal } from "@/components/admin/RejectModal"

interface Application {
  id: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  user: {
    id: string
    email: string
    name: string
  }
  organizationName: string
  organizationType: string
}

interface ApplicationDetails extends Application {
  website?: string
  description: string
  experience: string
  eventTypes: string[]
  phoneNumber: string
  address: string
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

const EVENT_TYPES = [
  { id: "conference", label: "Conferences & Seminars" },
  { id: "workshop", label: "Classes & Workshops" },
  { id: "concert", label: "Concerts & Performances" },
  { id: "exhibition", label: "Exhibitions & Trade Shows" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "networking", label: "Networking & Social Events" },
  { id: "festival", label: "Festivals & Celebrations" },
  { id: "corporate", label: "Corporate Events" },
] as const

// This would come from your API in a real app
const SAMPLE_APPLICATION: ApplicationDetails = {
  id: "1",
  status: "pending" as const,
  submittedAt: "2024-02-15T10:30:00Z",
  user: {
    id: "user1",
    email: "john@example.com",
    name: "John Doe",
  },
  organizationName: "EventPro Solutions",
  organizationType: "company",
  website: "https://eventpro.example.com",
  description: "We are a professional event management company with over 5 years of experience in organizing corporate and social events.",
  experience: "Successfully organized over 50 corporate events and conferences, including international tech summits and leadership workshops.",
  eventTypes: ["conference", "corporate", "networking"],
  phoneNumber: "+1 (555) 123-4567",
  address: "123 Business Ave, Suite 100, New York, NY 10001",
  socialLinks: {
    facebook: "https://facebook.com/eventpro",
    instagram: "https://instagram.com/eventpro",
    twitter: "https://twitter.com/eventpro",
    linkedin: "https://linkedin.com/company/eventpro",
  },
}

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const application = SAMPLE_APPLICATION // In a real app, fetch based on params.id

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      // In a real app, call your API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Application approved successfully")
      router.push("/admin/applications")
    } catch (error) {
      toast.error("Failed to approve application")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    setIsLoading(true)
    try {
      // In a real app, call your API with the reason
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Application rejected")
      router.push("/admin/applications")
    } catch (error) {
      toast.error("Failed to reject application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizer Application</h1>
            <p className="text-muted-foreground">
              Submitted on <time dateTime={application.submittedAt}>
                {format(new Date(application.submittedAt), "PPP")}
              </time>
            </p>
          </div>
          <Badge
            variant={
              application.status === "approved"
                ? "success"
                : application.status === "rejected"
                ? "destructive"
                : "default"
            }
            className={cn(
              "capitalize",
              application.status === "pending" && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {application.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="font-medium">Organization Name</div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{application.organizationName}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Organization Type</div>
              <Badge variant="outline" className="w-fit capitalize">
                {application.organizationType}
              </Badge>
            </div>

            {application.website && (
              <div className="grid gap-2">
                <div className="font-medium">Website</div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={application.website}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    {application.website}
                  </Link>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <div className="font-medium">Description</div>
              <p className="text-muted-foreground">{application.description}</p>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Experience</div>
              <p className="text-muted-foreground">{application.experience}</p>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Event Types</div>
              <div className="flex flex-wrap gap-2">
                {application.eventTypes.map((type) => {
                  const eventType = EVENT_TYPES.find(t => t.id === type)
                  return (
                    <Badge key={type} variant="secondary">
                      {eventType?.label || type}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="font-medium">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`mailto:${application.user.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.user.email}
                  </Link>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Phone Number</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`tel:${application.phoneNumber}`}
                    className="text-primary hover:underline"
                  >
                    {application.phoneNumber}
                  </Link>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Address</div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-muted-foreground">{application.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(application.socialLinks).map(([platform, url]) => {
                  if (!url) return null
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize">{platform}</span>
                      <Link
                        href={url}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </Link>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {application.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Review the application and take appropriate action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    className="flex-1"
                    onClick={() => setIsApproveModalOpen(true)}
                    disabled={isLoading}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isLoading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        isLoading={isLoading}
        application={application}
      />

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        isLoading={isLoading}
        application={application}
      />
    </div>
  )
}

