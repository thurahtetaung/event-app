"use client"

import { useEffect, useState } from "react"
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
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface ApplicationDetails {
  application: {
    id: string
    status: "pending" | "approved" | "rejected"
    createdAt: string
  organizationName: string
  organizationType: string
  description: string
  experience: string
    website: string | null
    eventTypes: string
  phoneNumber: string
  address: string
    socialLinks: string | null
  }
  applicant: {
    id: string
    email: string
    firstName: string
    lastName: string
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

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true;

    async function fetchApplication() {
      try {
        const data = await apiClient.organizerApplications.getById(params.id)
        if (isMounted) {
          setApplication(data as ApplicationDetails)
        }
      } catch (error) {
        if (isMounted && error instanceof Error && !error.message.includes('Request was cancelled')) {
          console.error("Error fetching application:", error)
          toast.error("Failed to load application details")
          router.push("/admin/applications")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchApplication()

    return () => {
      isMounted = false
    }
  }, [params.id, router])

  const handleApprove = async () => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await apiClient.organizerApplications.updateStatus(application.application.id, {
        status: "approved"
      })
      toast.success("Application approved successfully")
      router.push("/admin/applications")
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Failed to approve application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await apiClient.organizerApplications.updateStatus(application.application.id, {
        status: "rejected",
        rejectionReason: reason
      })
      toast.success("Application rejected")
      router.push("/admin/applications")
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Failed to reject application")
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!application) return null

  const socialLinks = application.application.socialLinks ? JSON.parse(application.application.socialLinks) : {}
  const eventTypes = JSON.parse(application.application.eventTypes) as string[]

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
              Submitted on <time dateTime={application.application.createdAt}>
                {format(new Date(application.application.createdAt), "PPP")}
              </time>
            </p>
          </div>
          <Badge
            variant={
              application.application.status === "approved"
                ? "success"
                : application.application.status === "rejected"
                ? "destructive"
                : "default"
            }
            className={cn(
              "capitalize",
              application.application.status === "pending" && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {application.application.status}
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
                <span>{application.application.organizationName}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Organization Type</div>
              <Badge variant="outline" className="w-fit capitalize">
                {application.application.organizationType}
              </Badge>
            </div>

            {application.application.website && (
              <div className="grid gap-2">
                <div className="font-medium">Website</div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={application.application.website}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    {application.application.website}
                  </Link>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <div className="font-medium">Description</div>
              <p className="text-muted-foreground">{application.application.description}</p>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Experience</div>
              <p className="text-muted-foreground">{application.application.experience}</p>
            </div>

            <div className="grid gap-2">
              <div className="font-medium">Event Types</div>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => {
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
                    href={`mailto:${application.applicant.email}`}
                    className="text-primary hover:underline"
                  >
                    {application.applicant.email}
                  </Link>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Phone Number</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Link
                    href={`tel:${application.application.phoneNumber}`}
                    className="text-primary hover:underline"
                  >
                    {application.application.phoneNumber}
                  </Link>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="font-medium">Address</div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="text-muted-foreground">{application.application.address}</span>
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
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize">{platform}</span>
                      <Link
                        href={url as string}
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

          {application.application.status === "pending" && (
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
                    disabled={isActionLoading}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isActionLoading}
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
        isLoading={isActionLoading}
        application={application}
      />

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        isLoading={isActionLoading}
        application={application}
      />
    </div>
  )
}


