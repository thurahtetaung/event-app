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
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  organizerId: string
  status: "draft" | "published" | "cancelled"
  ticketTypes: TicketType[]
  createdAt: string
  updatedAt: string
}