export interface Application {
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