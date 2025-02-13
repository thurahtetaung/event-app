"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a non-negative number",
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be greater than 0",
  }),
  saleStartDate: z.date(),
  saleEndDate: z.date(),
  hasMinimumPurchase: z.boolean().default(false),
  minimumPurchase: z.string().optional(),
  hasMaximumPurchase: z.boolean().default(false),
  maximumPurchase: z.string().optional(),
})

interface TicketFormProps {
  initialData?: {
    id?: string
    name: string
    description?: string
    price: number
    quantity: number
    saleStartDate?: Date
    saleEndDate?: Date
    minimumPurchase?: number
    maximumPurchase?: number
  }
  onSuccess?: () => void
}

export function TicketForm({ initialData, onSuccess }: TicketFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price?.toString() || "0",
      quantity: initialData?.quantity?.toString() || "1",
      saleStartDate: initialData?.saleStartDate || new Date(),
      saleEndDate: initialData?.saleEndDate || new Date(),
      hasMinimumPurchase: !!initialData?.minimumPurchase,
      minimumPurchase: initialData?.minimumPurchase?.toString(),
      hasMaximumPurchase: !!initialData?.maximumPurchase,
      maximumPurchase: initialData?.maximumPurchase?.toString(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // In a real app, make API call here
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Format the data for API submission
      const ticketData = {
        ...values,
        price: Number(values.price),
        quantity: Number(values.quantity),
        minimumPurchase: values.hasMinimumPurchase ? Number(values.minimumPurchase) : undefined,
        maximumPurchase: values.hasMaximumPurchase ? Number(values.maximumPurchase) : undefined,
      }

      // Simulate API call
      console.log("Submitting ticket data:", ticketData)

      toast.success(initialData ? "Ticket type updated successfully" : "Ticket type created successfully")
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving ticket:", error)
      toast.error(initialData ? "Failed to update ticket type" : "Failed to create ticket type")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Early Bird, VIP, Regular" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what's included with this ticket type"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Available</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="saleStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sale Start Date</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saleEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sale End Date</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasMinimumPurchase"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Minimum Purchase</FormLabel>
                <FormDescription>
                  Set a minimum number of tickets per order
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("hasMinimumPurchase") && (
          <FormField
            control={form.control}
            name="minimumPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Tickets</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="hasMaximumPurchase"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Maximum Purchase</FormLabel>
                <FormDescription>
                  Limit the number of tickets per order
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("hasMaximumPurchase") && (
          <FormField
            control={form.control}
            name="maximumPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Tickets</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Ticket Type"}
        </Button>
      </form>
    </Form>
  )
}