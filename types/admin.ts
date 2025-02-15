export interface Application {
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