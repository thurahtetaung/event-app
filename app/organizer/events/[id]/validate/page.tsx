"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, QrCode, TicketX } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

const ticketFormSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

export default function ValidateTicketsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      ticketId: "",
    },
  })

  function onSubmit(data: TicketFormValues) {
    setIsSubmitting(true)
    // Navigate to the ticket validation page with the entered ticket ID
    router.push(`/organizer/events/${id}/validate/${data.ticketId}`)
  }

  return (
    <div className="container py-8 max-w-md">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 pl-0" asChild>
          <Link href={`/organizer/events/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Validation</CardTitle>
          <CardDescription>
            Validate tickets for your event by entering a ticket ID or scanning a QR code
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Validate by Ticket ID</h3>
            <p className="text-sm text-muted-foreground">
              Enter the ticket ID to validate a ticket manually
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ticketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ticket ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Validating..." : "Validate Ticket"}
                </Button>
              </form>
            </Form>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Scan QR Code</h3>
            <p className="text-sm text-muted-foreground">
              Use your device's camera to scan a ticket QR code
            </p>
            <Button variant="outline" className="w-full" disabled>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Code (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}