"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"


import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { apiClient } from "@/lib/api-client"

interface TicketFormProps {
  eventId: string
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
    soldCount?: number // Add soldCount here
  }
  onSuccess?: () => void
}

export function TicketForm({ eventId, initialData, onSuccess }: TicketFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Define the schema inside the component to access initialData
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    isFree: z.boolean().default(false),
    price: z.coerce.number().min(0, "Price must be a non-negative number"),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be greater than 0",
    }),
    saleStartDate: z.date({
      required_error: "Sale start date is required",
    }),
    saleEndDate: z.date({
      required_error: "Sale end date is required",
    }).min(new Date(), "Sale end date must be in the future"),
    hasMinimumPurchase: z.boolean().default(false),
    minimumPurchase: z.string().optional(),
    hasMaximumPurchase: z.boolean().default(false),
    maximumPurchase: z.string().optional(),
  }).refine((data) => {
    // Validate that end date is after start date
    if (data.saleStartDate && data.saleEndDate) {
      return data.saleEndDate > data.saleStartDate;
    }
    return true;
  }, {
    message: "Sale end date must be after sale start date",
    path: ["saleEndDate"],
  }).refine((data) => {
    // If it's a free ticket, price should be 0
    if (data.isFree) {
      // Allow setting price to 0 explicitly for free tickets
      return true;
    }
    // For paid tickets, price must be greater than 0
    return Number(data.price) > 0;
  }, {
    message: "Paid tickets must have a price greater than 0",
    path: ["price"],
  }).refine((data) => {
    // Validate quantity against sold count if initialData is provided
    if (initialData?.soldCount !== undefined) {
      const quantityNum = Number(data.quantity);
      return !isNaN(quantityNum) && quantityNum >= initialData.soldCount;
    }
    return true; // Skip validation if soldCount is not available
  }, {
    message: `Quantity cannot be less than the number of tickets already sold (${initialData?.soldCount || 0})`,
    path: ["quantity"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isFree: initialData?.price === 0,
      price: initialData?.price || 0,
      quantity: initialData?.quantity?.toString() || "1",
      saleStartDate: initialData?.saleStartDate || new Date(),
      saleEndDate: initialData?.saleEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      hasMinimumPurchase: !!initialData?.minimumPurchase,
      minimumPurchase: initialData?.minimumPurchase?.toString(),
      hasMaximumPurchase: !!initialData?.maximumPurchase,
      maximumPurchase: initialData?.maximumPurchase?.toString(),
    },
  })

  // Watch isFree to disable price field
  const isFree = form.watch("isFree")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Properly create date objects in local timezone
      const createLocalDate = (date: Date): string => {
        // Extract year, month, day from the local date
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // Create a new date at midnight in the local timezone
        const localDate = new Date(year, month, day, 0, 0, 0, 0);

        // Convert to ISO string for storage (this will convert to UTC)
        return localDate.toISOString();
      };

      // Format the data for API submission
      const ticketData = {
        name: values.name,
        description: values.description,
        price: isFree ? 0 : Number(values.price),
        quantity: Number(values.quantity),
        type: isFree ? "free" as const : "paid" as const,
        saleStart: createLocalDate(values.saleStartDate),
        saleEnd: createLocalDate(values.saleEndDate),
        maxPerOrder: values.hasMaximumPurchase ? Number(values.maximumPurchase) : undefined,
        minPerOrder: values.hasMinimumPurchase ? Number(values.minimumPurchase) : undefined,
      }

      if (initialData?.id) {
        await apiClient.events.updateTicketType(eventId, initialData.id, ticketData)
      } else {
        await apiClient.events.createTicketType(eventId, ticketData)
      }

      toast.success(initialData ? "Ticket type updated successfully" : "Ticket type created successfully")
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error("Error saving ticket:", error)

      // Extract error message from the API response
      let errorMessage: string;
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response?.data?.error;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else {
        errorMessage = initialData ? "Failed to update ticket type" : "Failed to create ticket type";
      }

      // Show error in toast
      toast.error(errorMessage);

      // Set form field errors based on the error message
      if (errorMessage?.toLowerCase().includes('quantity') || errorMessage?.toLowerCase().includes('capacity')) {
        form.setError('quantity', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.toLowerCase().includes('price')) {
        form.setError('price', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.toLowerCase().includes('sale') && errorMessage?.toLowerCase().includes('start')) {
        form.setError('saleStartDate', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.toLowerCase().includes('sale') && errorMessage?.toLowerCase().includes('end')) {
        form.setError('saleEndDate', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.toLowerCase().includes('minimum')) {
        form.setError('minimumPurchase', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage?.toLowerCase().includes('maximum')) {
        form.setError('maximumPurchase', {
          type: 'manual',
          message: errorMessage
        });
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your ticket type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Quantity</CardTitle>
              <CardDescription>Set the price and available quantity for this ticket type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Ticket</FormLabel>
                      <FormDescription>
                        This ticket will be free for attendees
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked) {
                            form.setValue("price", 0)
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
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
                          disabled={isFree}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sale Period</CardTitle>
              <CardDescription>Set when tickets will be available for purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="saleStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(Date.now() - 86400000)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saleEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Limits</CardTitle>
              <CardDescription>Set minimum and maximum purchase limits per order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? initialData
                ? "Saving..."
                : "Creating..."
              : initialData
                ? "Save Changes"
                : "Create Ticket Type"
            }
          </Button>
        </div>
      </form>
    </Form>
  )
}