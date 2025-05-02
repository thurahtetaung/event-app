export interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  type: "free" | "paid"
  saleStart: string
  saleEnd: string
  maxPerOrder?: number
  minPerOrder?: number
  status: "on-sale" | "paused" | "sold-out" | "scheduled"
  soldCount: number
}

export interface Event {
  id: string
  title: string // Renamed from name for consistency with backend
  description: string
  startTimestamp: string // Renamed from startDate
  endTimestamp: string // Renamed from endDate
  venue: string // Renamed from location
  address?: string // Added address
  isOnline: boolean // Added isOnline
  coverImage?: string // Added coverImage
  organizationId: string
  status: "draft" | "published" | "cancelled"
  ticketTypes: TicketType[]
  timezone: string // Add timezone field
  createdAt: string
  updatedAt: string
  organization?: { // Added optional organization details
    name: string
  }
}